import { db } from '../db';
import { users, posts, postsRelations } from '../schema';
import { eq, desc, asc, like, and, or, sql } from 'drizzle-orm';

export async function getUserById(id: number) {
  return db.query.users.findFirst({
    where: eq(users.id, id),
  });
}

export async function getUserWithPosts(userId: number) {
  return db.query.users.findFirst({
    where: eq(users.id, userId),
    with: {
      posts: true,
    },
  });
}

export async function searchPosts(query: string, publishedOnly = true) {
  return db.select({
    id: posts.id,
    title: posts.title,
    content: posts.content,
    authorName: users.name,
  })
  .from(posts)
  .innerJoin(users, eq(posts.userId, users.id))
  .where(
    and(
      publishedOnly ? eq(posts.published, true) : undefined,
      or(
        like(posts.title, `%${query}%`),
        like(posts.content, `%${query}%`)
      )
    )
  )
  .orderBy(desc(posts.createdAt))
  .limit(10);
}

export async function createUser(data: typeof users.$inferInsert) {
  return db.insert(users).values(data).returning();
}

export async function updateUser(id: number, data: Partial<typeof users.$inferInsert>) {
  return db.update(users)
    .set({ ...data, updatedAt: new Date() })
    .where(eq(users.id, id))
    .returning();
}
