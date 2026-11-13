import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { archives, archivePhases } from './creationArchive.js';
import { projects } from './projects.js';
import { PageTitle, ProjectImage } from './components.jsx';
import PaperIcon from './PaperIcon.jsx';

function ArchiveTitle({ title }) {
  useEffect(() => { document.title = `${title} · IJane Studio`; }, [title]);
  return null;
}

function Evidence({ evidence }) {
  const [selected, setSelected] = useState(0);
  const current = evidence.frames[selected];
  const kind = { versions: '版本对照', states: '交互状态', single: '阶段实录' }[evidence.kind];
  return <div className="archive-evidence">
    <div className="archive-evidence-top"><span className="archive-stamp">{kind}</span>
      {evidence.frames.length > 1 && <div className="archive-switch" role="group" aria-label="切换证据画面">
        {evidence.frames.map((item, index) => <button className="paper-control" key={item.src} aria-pressed={selected === index} onClick={() => setSelected(index)}>{item.label}</button>)}
      </div>}
    </div>
    <figure>
      <div className="archive-image"><ProjectImage image={current} /></div>
      <figcaption aria-live="polite">{current.caption}</figcaption>
    </figure>
    {evidence.note && <p className="archive-evidence-note">{evidence.note}</p>}
  </div>;
}

export function ArchiveIndexPage() {
  const [filter, setFilter] = useState('all');
  const visible = archives.filter(a => filter === 'all' || projects.find(p => p.id === a.id).nature === filter);
  return <div className="page-wrap archive-index">
    <ArchiveTitle title="创作档案" />
    <PageTitle number="02 / FIELD NOTES" title="创作档案" description="把尝试留下，把选择讲清楚。沿着真实材料，翻看作品如何一步步成形。" />
    <div className="archive-intro-note"><span className="handwritten">Behind the finished work.</span><p>每本过程册都有一条线索：<br /><strong>从什么问题开始，为什么修改，后来变成了什么。</strong></p><small>根据制作记录整理 · 含阶段截图与来源说明</small></div>
    <div className="filter-bar" role="group" aria-label="按档案性质筛选">
      {[['all', '全部档案'], ['work', '工作项目'], ['personal', '个人探索']].map(([id, label]) => <button key={id} aria-pressed={filter === id} onClick={() => setFilter(id)}>{label}</button>)}
      <span className="filter-result" aria-live="polite">{visible.length} 本过程册</span>
    </div>
    <div className="archive-shelf">{visible.map(archive => {
      const project = projects.find(p => p.id === archive.id);
      return <article className="archive-notebook" key={archive.id}>
        <div className="archive-notebook-image"><ProjectImage image={project.cover} /><span className="archive-slip">过程册 / 0{archives.indexOf(archive) + 1}</span></div>
        <div className="archive-notebook-copy"><p className="archive-meta">{project.nature === 'work' ? '工作项目' : '个人探索'} · {archive.period}</p><h2>{project.title}</h2><h3>{archive.question}</h3><p>{archive.summary}</p><span className="archive-materials">{archive.stages.length} 个阶段 · {archive.stages.filter(s => s.evidence).length} 组画面 · 制作记录摘要</span><Link className="paper-control" to={'/archive/' + archive.id} aria-label={'打开' + project.title + '创作档案'}><PaperIcon />翻开过程册</Link></div>
      </article>;
    })}</div>
    <div className="archive-footer"><p>过程是持续的判断。<br />这些记录里，也保留了尚未补齐的材料。</p><Link className="paper-control" to="/works"><PaperIcon />回到作品展厅</Link></div>
  </div>;
}

export function ArchivePage() {
  const { id } = useParams();
  const archive = archives.find(a => a.id === id);
  const project = projects.find(p => p.id === id);
  if (!archive || !project) return <div className="page-wrap archive-missing"><ArchiveTitle title="档案尚未收录" /><h1>这份过程，还在整理。</h1><Link className="paper-control" to="/archive"><PaperIcon type="back" />返回创作档案</Link></div>;
  const next = archives[(archives.indexOf(archive) + 1) % archives.length];
  const jump = index => {
    const heading = document.getElementById('archive-stage-' + index);
    heading?.scrollIntoView({ block: 'start' });
    heading?.focus({ preventScroll: true });
  };
  return <article key={id} className="page-wrap archive-detail">
    <ArchiveTitle title={project.title + ' · 创作档案'} />
    <div className="archive-breadcrumb"><Link className="paper-control" to="/archive"><PaperIcon type="back" />全部档案</Link><Link className="paper-control" to={'/works/' + id}><PaperIcon />查看完整作品</Link></div>
    <header className="archive-heading"><p className="archive-meta">过程册 0{archives.indexOf(archive) + 1} / {project.nature === 'work' ? '工作项目' : '个人探索'} / {archive.period}</p><h1>{project.title}</h1><p className="archive-question">{archive.question}</p><p className="archive-summary">{archive.summary}</p></header>
    <aside className="archive-margin-note"><span className="handwritten">A note to keep.</span><p>{archive.takeaway}</p></aside>
    <dl className="archive-roles"><div><dt>我的判断与工作</dt><dd>{archive.role}</dd></div><div><dt>AI 与其他资产</dt><dd>{archive.aiRole}</dd></div></dl>
    <div className="archive-reading"><nav className="archive-chapters" aria-label="档案阶段"><span>沿着过程阅读</span>{archivePhases.map((label, index) => <button key={label} onClick={() => jump(index)}><small>0{index + 1}</small>{label}</button>)}</nav>
      <div className="archive-stages">{archive.stages.map((stage, index) => <section className="archive-stage" key={id + index}>
        <p className="archive-stage-label"><span>0{index + 1} / {archivePhases[index]}</span><span>{stage.date}</span></p>
        <h2 id={'archive-stage-' + index} tabIndex={-1}>{stage.title}</h2><p className="archive-body">{stage.body}</p>
        {stage.iteration && <ol className="archive-decision">{stage.iteration.map(item => { const [label, ...body] = item.split('：'); return <li key={label}><strong>{label}</strong><p>{body.join('：')}</p></li>; })}</ol>}
        {stage.evidence && <Evidence key={id + index} evidence={stage.evidence} />}
        {stage.note && <p className="archive-evidence-note">{stage.note}</p>}
        <details className="archive-source"><summary>展开材料来源 <span>{stage.sourceIds.length} 份记录</span></summary><div><p className="archive-source-caption">以下为原始制作记录与画面的编辑摘要，不是对话逐字稿。</p>{stage.sourceIds.map(sourceId => { const source = archive.sources.find(s => s.id === sourceId); return <div className="archive-source-item" key={source.id}><h3>{source.title}</h3><small>{source.date}</small><p>{source.summary}</p></div>; })}</div></details>
      </section>)}</div>
    </div>
    <section className="archive-boundary"><span className="handwritten">Still in the notebook.</span><h2>这份记录的边界</h2><p>{archive.boundary}</p></section>
    <div className="archive-footer"><Link className="paper-control" to={'/works/' + id}><PaperIcon />回到这份作品</Link><Link className="paper-control" to={'/archive/' + next.id}>下一本：{projects.find(p => p.id === next.id).title}<PaperIcon type="next" /></Link></div>
  </article>;
}
