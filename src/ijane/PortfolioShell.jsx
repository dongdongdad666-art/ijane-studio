import { useEffect, useLayoutEffect, useRef } from 'react';
import { Link, NavLink, useLocation, useNavigationType } from 'react-router-dom';
const positions = new Map();
function PagePosition() {
  const location = useLocation();
  const type = useNavigationType();
  const route = location.pathname + location.search;
  const previousPath = useRef(null);
  useLayoutEffect(() => {
    const samePage = previousPath.current === location.pathname;
    previousPath.current = location.pathname;
    const remember = () => positions.set(route, { y: window.scrollY, focus: document.activeElement?.id });
    if(samePage) return remember;
    const previous = positions.get(route);
    const restoring = type === 'POP' || location.state?.restoreFocus;
    window.scrollTo({ top: restoring ? (previous?.y || 0) : 0, behavior: 'instant' });
    const targetId = location.state?.restoreFocus || (type === 'POP' && previous?.focus);
    const timer = requestAnimationFrame(() => {
      if (targetId) document.getElementById(targetId)?.focus({ preventScroll: true });
      else document.getElementById('main-content')?.focus({ preventScroll: true });
    });
    return () => {
      cancelAnimationFrame(timer);
      remember();
    };
  }, [route, type, location.key, location.state, location.pathname]);
  return null;
}
export default function PortfolioShell({children}) {
  const location = useLocation();
  const menu = useRef(null);
  useEffect(() => { if (menu.current) menu.current.open = false; }, [location.pathname]);
  return <div className="site">
    <a className="skip-link" href="#main-content">跳到主要内容</a>
    <header className="site-header">
      <Link className="wordmark" to="/" aria-label="IJane Studio 首页">IJane<span>Studio</span><i className="wordmark-dot" /></Link>
      <nav className="desktop-nav" aria-label="主导航">
        <NavLink to="/works">作品</NavLink><NavLink to="/process">制作过程</NavLink>
        <NavLink to="/about">关于我</NavLink><NavLink to="/contact">联系</NavLink>
      </nav>
      <Link className="header-studio" to="/studio">进入工作室 <span aria-hidden="true">↗</span></Link>
      <details className="mobile-menu" ref={menu}><summary>菜单</summary>
        <nav aria-label="手机导航"><NavLink to="/works">作品</NavLink><NavLink to="/process">制作过程</NavLink>
        <NavLink to="/about">关于我</NavLink><NavLink to="/contact">联系</NavLink><NavLink to="/studio">探索工作室</NavLink></nav>
      </details>
    </header><PagePosition />
    <main id="main-content" tabIndex={-1}>{children}</main>
    <footer className="site-footer">
      <Link className="footer-name" to="/">IJane Studio <span>栀远的创作工作室</span></Link>
      <span>保持好奇，也爱自己。</span>
      <details className="credits"><summary>关于这个网站</summary><p>基于 <a href="https://github.com/ITomPoland/portfolio-itom" target="_blank" rel="noreferrer">ITom 开源项目</a>二次创作。代码保留 MIT 许可；空间、个人内容与作品展示重新设计。<a href="/LICENSE.txt">查看许可</a></p></details>
    </footer>
  </div>;
}
