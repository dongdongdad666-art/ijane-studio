import { useRef, useState, useEffect, useMemo } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import { useTexture } from '@react-three/drei';
import { SRGBColorSpace, MathUtils } from 'three';
import gsap from 'gsap';
import '../shaders/RevealMaterial';
import { useAchievements } from '../../../context/AchievementsContext';
import { isTouchDevice } from '../../../utils/deviceDetect';
import ChapelFacade from '../../../ijane/ChapelFacade.jsx';
import { createDoorFaceGeometry, chapelFraming } from '../../../ijane/chapelGeometry.js';

// The original entrance's hinge/handle/flight choreography is preserved below.
// Only the exterior and the door artwork are replaced with IJane's chapel.
const EntranceDoors = ({ position = [0, 0, 22], onComplete }) => {
    const leftDoorRef = useRef(), rightDoorRef = useRef();
    const leftHandleRef = useRef(), rightHandleRef = useRef();
    const rightDoorMaterialRef = useRef(), leftDoorMaterialRef = useRef();
    const leftHandleMaterialRef = useRef(), rightHandleMaterialRef = useRef();
    const leftHandlePaintedRef = useRef(), rightHandlePaintedRef = useRef();
    const handleHideDelayRef = useRef();
    const [isOpen, setIsOpen] = useState(false);
    const [, setIsHovered] = useState(false);
    const [isAnimating, setIsAnimating] = useState(false);
    const { camera, size } = useThree();
    const { unlockAchievement } = useAchievements();
    const isMobile = isTouchDevice() || window.innerWidth < 1000;
    const source = useTexture('/ijane/chapel/facade-paper-v4.webp');
    const texture = useMemo(() => {
        const t=source.clone(); t.colorSpace=SRGBColorSpace; t.needsUpdate=true; return t;
    }, [source]);
    const faces=useMemo(()=>[createDoorFaceGeometry('left'),createDoorFaceGeometry('right')],[]);
    useEffect(()=>()=>{texture.dispose();faces.forEach(g=>g.dispose());handleHideDelayRef.current?.kill();},[texture,faces]);
    // Frame the new exterior only. Position, rotation and the original GSAP
    // flight are untouched; restore the corridor's 60° lens before the threshold.
    const entranceFov = MathUtils.radToDeg(2*Math.atan(Math.min(chapelFraming.height,chapelFraming.width/(size.width/size.height))/12));
    useFrame(({camera: activeCamera})=>{
        const flight=MathUtils.smoothstep(28-activeCamera.position.z,0,5);
        const fov=MathUtils.lerp(entranceFov,60,flight);
        if(Math.abs(activeCamera.fov-fov)>.01){activeCamera.fov=fov;activeCamera.updateProjectionMatrix();}
    });
    useEffect(()=>()=>{camera.fov=60;camera.updateProjectionMatrix();},[camera]);
    // Handle click
    const handleClick = (e) => {
        e.stopPropagation();
        if (isOpen || isAnimating) return;

        // Reset cursor immediately on transition start
        document.body.style.cursor = "auto";

        setIsOpen(true);
        setIsAnimating(true);
        // Music starts only through explicit audio controls.
        unlockAchievement('corridor_enter');

        const tl = gsap.timeline({
            onComplete: () => {
                onComplete?.();
            }
        });

        // Press handles down fully (like really opening)
        if (leftHandleRef.current) {
            tl.to(leftHandleRef.current.rotation, {
                z: 0.4,
                duration: 0.15,
                ease: 'power2.out'
            }, 0);
        }
        if (rightHandleRef.current) {
            tl.to(rightHandleRef.current.rotation, {
                z: -0.4,
                duration: 0.15,
                ease: 'power2.out'
            }, 0);
        }

        // Open doors - smoother angle (matches SegmentDoors)
        tl.to(leftDoorRef.current.rotation, {
            y: -Math.PI * 0.55,
            duration: 0.9,
            ease: 'power2.out'
        }, 0.1);

        tl.to(rightDoorRef.current.rotation, {
            y: Math.PI * 0.55,
            duration: 0.9,
            ease: 'power2.out'
        }, 0.1);

        // Camera flies through - STOP CLOSER to avatar/ITOM
        tl.to(camera.position, {
            z: 11,  // Closer stop point (was 11)
            y: 0.2, // Match hook's base Y position
            duration: 1.8,
            ease: 'power2.inOut'
        }, 0.3);
    };

    useEffect(() => {
        const enter = () => handleClick({stopPropagation:()=>{}});
        window.addEventListener('ijane-enter', enter);
        return () => window.removeEventListener('ijane-enter', enter);
    });
    // Handle hover - doors slightly open to indicate interactivity
    const handlePointerEnter = () => {
        if (isOpen || isAnimating || isMobile) return;
        setIsHovered(true);
        document.body.style.cursor = "pointer";

        // Slightly open doors on hover
        gsap.to(leftDoorRef.current.rotation, {
            y: -0.08,
            duration: 0.3,
            ease: 'power2.out',
            overwrite: true
        });
        gsap.to(rightDoorRef.current.rotation, {
            y: 0.08,
            duration: 0.3,
            ease: 'power2.out',
            overwrite: true
        });

        // Rotate handles down slightly (hint effect)
        if (leftHandleRef.current) {
            gsap.to(leftHandleRef.current.rotation, {
                z: 0.1,
                duration: 0.2,
                ease: 'power2.out',
                overwrite: true
            });
        }
        if (rightHandleRef.current) {
            gsap.to(rightHandleRef.current.rotation, {
                z: -0.1,
                duration: 0.2,
                ease: 'power2.out',
                overwrite: true
            });
        }

        // Brush-stroke reveal: discard sketch pixels to show painted door beneath
        if (rightDoorMaterialRef.current) {
            gsap.to(rightDoorMaterialRef.current, {
                uProgress: 1.0,
                duration: 0.8,
                ease: 'power2.out',
                overwrite: true
            });
        }
        if (leftDoorMaterialRef.current) {
            gsap.to(leftDoorMaterialRef.current, {
                uProgress: 1.0,
                duration: 0.8,
                ease: 'power2.out',
                overwrite: true
            });
        }
        if (leftHandleMaterialRef.current) {
            gsap.to(leftHandleMaterialRef.current, {
                uProgress: 1.0,
                duration: 0.8,
                ease: 'power2.out',
                overwrite: true
            });
        }
        if (rightHandleMaterialRef.current) {
            gsap.to(rightHandleMaterialRef.current, {
                uProgress: 1.0,
                duration: 0.8,
                ease: 'power2.out',
                overwrite: true
            });
        }
        // Show painted handles (kill any pending hide from previous leave)
        if (handleHideDelayRef.current) handleHideDelayRef.current.kill();
        if (leftHandlePaintedRef.current) leftHandlePaintedRef.current.visible = true;
        if (rightHandlePaintedRef.current) rightHandlePaintedRef.current.visible = true;
    };

    const handlePointerLeave = () => {
        if (isOpen || isAnimating || isMobile) return;
        setIsHovered(false);
        document.body.style.cursor = "auto";

        // Close doors back
        gsap.to(leftDoorRef.current.rotation, {
            y: 0,
            duration: 0.3,
            ease: 'power2.out',
            overwrite: true
        });
        gsap.to(rightDoorRef.current.rotation, {
            y: 0,
            duration: 0.3,
            ease: 'power2.out',
            overwrite: true
        });

        // Reset handles
        if (leftHandleRef.current) {
            gsap.to(leftHandleRef.current.rotation, {
                z: 0,
                duration: 0.2,
                ease: 'power2.out',
                overwrite: true
            });
        }
        if (rightHandleRef.current) {
            gsap.to(rightHandleRef.current.rotation, {
                z: 0,
                duration: 0.2,
                ease: 'power2.out',
                overwrite: true
            });
        }

        // Reverse brush-stroke reveal
        if (rightDoorMaterialRef.current) {
            gsap.to(rightDoorMaterialRef.current, {
                uProgress: 0.0,
                duration: 0.5,
                ease: 'power2.out',
                overwrite: true
            });
        }
        if (leftDoorMaterialRef.current) {
            gsap.to(leftDoorMaterialRef.current, {
                uProgress: 0.0,
                duration: 0.5,
                ease: 'power2.out',
                overwrite: true
            });
        }
        if (leftHandleMaterialRef.current) {
            gsap.to(leftHandleMaterialRef.current, {
                uProgress: 0.0,
                duration: 0.5,
                ease: 'power2.out',
                overwrite: true
            });
        }
        if (rightHandleMaterialRef.current) {
            gsap.to(rightHandleMaterialRef.current, {
                uProgress: 0.0,
                duration: 0.5,
                ease: 'power2.out',
                overwrite: true
            });
        }

        // Hide painted handles after reverse animation completes
        handleHideDelayRef.current = gsap.delayedCall(0.55, () => {
            if (leftHandlePaintedRef.current) leftHandlePaintedRef.current.visible = false;
            if (rightHandlePaintedRef.current) rightHandlePaintedRef.current.visible = false;
        });
    };




    return <group position={[position[0],0,position[2]]} scale={[size.width/size.height<.8?1:1.2,1,1]} name="ijane-entrance">
        <ChapelFacade texture={texture}/>
        {[
            {side:-1, hinge:leftDoorRef, handle:leftHandleRef, material:leftDoorMaterialRef},
            {side:1, hinge:rightDoorRef, handle:rightHandleRef, material:rightDoorMaterialRef},
        ].map(({side,hinge,handle,material},index)=><group key={side} ref={hinge} position={[side*.94,-.55,0]}>
            <mesh position={[-side*.47,0,.06]} onClick={handleClick} onPointerEnter={handlePointerEnter} onPointerLeave={handlePointerLeave}>
                <boxGeometry args={[.94,2.4,.04]}/><meshBasicMaterial color="#8ca8ba" userData={{ijanePlainColor:true}}/>
            </mesh>
            <mesh position={[-side*.47,0,.088]} geometry={faces[index]}>
                <meshBasicMaterial map={texture} toneMapped={false} color="#e1edf5"/>
            </mesh>
            <mesh position={[-side*.47,0,.09]} geometry={faces[index]}>
                <revealMaterial ref={material} map={texture} toneMapped={false} transparent depthWrite={false} uProgress={0}/>
            </mesh>
            <group ref={handle} position={[-side*.827,-.099,.11]}>
                <mesh position={[0,.1,.035]}><boxGeometry args={[.035,.31,.045]}/><meshBasicMaterial color="#dae0dc" userData={{ijanePlainColor:true}}/></mesh>
                {[-.035,.235].map(y=><mesh key={y} position={[0,y,.014]}><boxGeometry args={[.048,.035,.035]}/><meshBasicMaterial color="#82939b" userData={{ijanePlainColor:true}}/></mesh>)}
            </group>
        </group>)}
    </group>;
};
export default EntranceDoors;
