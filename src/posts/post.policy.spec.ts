import type { User } from '../users/entities/user.entity.js';
import type { Post } from './entities/post.entity.js';
import { PostPolicy } from './post.policy.js';

const author = { id: 1 } as User;
const other = { id: 2 } as User;
const published = { id: 1, authorId: 1, published: true } as Post;
const draft = { id: 2, authorId: 1, published: false } as Post;

describe('PostPolicy', () => {
  const policy = new PostPolicy();

  it('shows published posts to everyone, drafts only to the author', () => {
    expect(policy.view(null, published)).toBe(true);
    expect(policy.view(null, draft)).toBe(false);
    expect(policy.view(other, draft)).toBe(false);
    expect(policy.view(author, draft)).toBe(true);
  });

  it('lets only signed-in users create', () => {
    expect(policy.create(null)).toBe(false);
    expect(policy.create(other)).toBe(true);
  });

  it('lets only the author update and delete', () => {
    expect(policy.update(author, published)).toBe(true);
    expect(policy.update(other, published)).toBe(false);
    expect(policy.delete(author, published)).toBe(true);
    expect(policy.delete(other, published)).toBe(false);
  });
});
