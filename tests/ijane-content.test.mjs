import test from 'node:test';
import assert from 'node:assert/strict';
import { stat } from 'node:fs/promises';
import { projects, featuredIds } from '../src/ijane/projects.js';
import { profile } from '../src/ijane/profile.js';

const expectedIds = ['phase-origin', 'shunlu', 'belite', 'otherspace', 'machine-misread', 'petway', 'returnlens', 'starry-night', 'scent-atlas', 'abyssal-genesis', 'neon-run'];

test('confirmed scope, order, and work classification', () => {
  assert.deepEqual(projects.map(p => p.id), expectedIds);
  assert.equal(new Set(projects.map(p => p.id)).size, expectedIds.length);
  assert.deepEqual(featuredIds, expectedIds.slice(0, 4));
  assert.deepEqual(projects.filter(p => p.nature === 'work').map(p => p.id), ['belite', 'returnlens']);
  assert.deepEqual(projects.filter(p => p.depth === 'full').map(p => p.id), featuredIds);
});

test('every case has substantive content and a safe real destination', () => {
  for (const project of projects) {
    for (const key of ['title', 'subtitle', 'summary', 'role', 'aiRole']) assert.ok(project[key]?.trim(), `${project.id}.${key}`);
    assert.ok(['work', 'personal'].includes(project.nature));
    assert.ok(['full', 'compact'].includes(project.depth));
    assert.equal(new URL(project.url).protocol, 'https:');
    assert.ok(Array.isArray(project.tags) && project.tags.length >= 2);
    assert.ok(project.sections.length >= (project.depth === 'full' ? 4 : 2));
    for (const section of project.sections) {
      assert.ok(section.title?.trim());
      assert.equal(typeof section.body, 'string');
      assert.ok(section.body.length > 20);
    }
  }
});

test('all published media are local, attributed, and present', async () => {
  for (const project of projects) {
    const images = [project.cover, ...project.sections.flatMap(section => section.media ? [section.media] : [])];
    if (project.depth === 'full') assert.ok(images.length >= 3, `${project.id}: two secondary images`);
    for (const media of images) {
      assert.match(media.src, /^\/projects\/[a-z0-9-]+\.webp$/);
      assert.ok(media.alt?.trim());
      assert.ok(media.source?.trim());
      assert.ok((await stat(new URL(`../public-ijane${media.src}`, import.meta.url))).size > 1000, media.src);
    }
  }
});

test('public profile preserves confirmed identity and missing contact fields', () => {
  assert.equal(profile.name, 'IJane');
  assert.equal(profile.chineseName, '栀远');
  assert.ok(profile.headline && profile.bio);
  assert.equal(profile.contact, null);
  assert.equal(profile.resume, null);
});
