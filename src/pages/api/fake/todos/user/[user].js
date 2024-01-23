import uniqid from "uniqid";
import { z } from "zod";
import { eq } from "drizzle-orm";
import { db } from "@/db";
import { todos, users } from "@/db/schema";

const userSchema = z.string().min(2).max(20);
const idSchema = z.string();
const labelSchema = z.string().min(1);

export default async function handler(req, res) {
  if (req.method === "GET") {
    //   const user = await db
    //     .select()
    //     .from(users)
    //     .where(eq(users.username, req.query.user));
    //   if (!user.length) {
    //     res.status(400).json({ message: "User doesn't exists" });
    //     return;
    //   }

    const data = await db
      .select()
      .from(todos)
      .where(eq(todos.username, req.query.user));

    res.status(200).json({ data });
  } else if (req.method === "POST") {
    const result = userSchema.safeParse(req.query.user);

    if (!result.success) {
      const { errors } = result.error;
      res.status(400).json({ message: errors[0].message });
      return;
    }

    const data = await db
      .select()
      .from(users)
      .where(eq(users.username, req.query.user));

    if (data.length) {
      res.status(400).json({ message: "User already exists" });
      return;
    }

    await db.transaction(async (tx) => {
      await tx.insert(users).values({ id: uniqid(), username: req.query.user });
      await tx.insert(todos).values({
        id: uniqid(),
        label: "new task",
        done: false,
        username: req.query.user,
      });
    });

    // await db.insert(users).values({ id: uniqid(), username: req.query.user });

    // await db.insert(todos).values(
    //   {
    //     id: uniqid(),
    //     label: "new task",
    //     done: false,
    //     username: req.query.user,
    //   },
    // );

    res.status(200).json({
      message: `The user ${req.query.user} has been created successfully`,
    });
  } else if (req.method === "PUT") {
    const result = idSchema.safeParse(req.body.id);

    if (req.body.id && !result.success) {
      const { errors } = result.error;

      res.status(400).json({ message: errors[0].message });
      return;
    }
    if (req.body.id) {
      const taskStatus = await db
        .select({ done: todos.done })
        .from(todos)
        .where(eq(todos.id, req.body.id));
      await db
        .update(todos)
        .set({ done: !taskStatus[0].done })
        .where(eq(todos.id, req.body.id));

      res.status(200).json({ message: "Task updated successfully" });
    } else {
      const result = labelSchema.safeParse(req.body.label);
      if (!result.success) {
        const { errors } = result.error;

        res.status(400).json({ message: errors[0].message });
        return;
      }

      await db.insert(todos).values([
        {
          id: uniqid(),
          label: req.body.label,
          done: false,
          username: req.query.user,
        },
      ]);

      res.status(200).json({ message: "Task added successfully" });
    }
  } else if (req.method === "DELETE") {
    await db.delete(todos).where(eq(todos.id, req.body.id));
    res.status(200).json({ message: "Task deleted successfully" });
  }
}
