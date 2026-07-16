import { NextResponse } from "next/server";
import { getSession, hashPassword, setSessionCookie } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function POST(request: Request) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { name, phone, email, avatar, password } = body;

    if (!name || !email) {
      return NextResponse.json({ error: "Name and email are required" }, { status: 400 });
    }

    const emailLower = email.toLowerCase();

    // Check if email taken
    if (emailLower !== session.email) {
      const taken = await prisma.user.findUnique({
        where: { email: emailLower },
      });
      if (taken) {
        return NextResponse.json({ error: "Email is already taken by another account" }, { status: 400 });
      }
    }

    const updateData: any = {
      name,
      email: emailLower,
      phone: phone || null,
      avatar: avatar || null,
    };

    if (password && password.trim().length >= 6) {
      updateData.password = await hashPassword(password);
    }

    const updatedUser = await prisma.user.update({
      where: { id: session.id },
      data: updateData,
    });

    const newSession = {
      id: updatedUser.id,
      email: updatedUser.email,
      name: updatedUser.name,
      role: updatedUser.role,
      avatar: updatedUser.avatar,
    };

    await setSessionCookie(newSession);

    await prisma.notification.create({
      data: {
        userId: session.id,
        title: "Profile Updated",
        message: "Your profile details have been successfully modified.",
      },
    });

    return NextResponse.json({
      success: true,
      user: {
        id: updatedUser.id,
        email: updatedUser.email,
        name: updatedUser.name,
        role: updatedUser.role,
        avatar: updatedUser.avatar,
        phone: updatedUser.phone,
      },
    });
  } catch (error) {
    console.error("Profile Update Error:", error);
    return NextResponse.json({ error: "Something went wrong" }, { status: 500 });
  }
}
