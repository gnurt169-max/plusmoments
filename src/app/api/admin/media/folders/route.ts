import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

function formatBytes(bytes: number, decimals = 1): string {
  if (bytes === 0) return '0 B';
  const k = 1024;
  const dm = decimals < 0 ? 0 : decimals;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
}

function slugifyFolder(name: string): string {
  if (!name) return 'folder';
  return (
    name
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[đĐ]/g, 'd')
      .replace(/[^a-z0-9_-]/g, '-')
      .replace(/-+/g, '-')
      .replace(/^-|-$/g, '')
      .slice(0, 60) || 'folder'
  );
}

export async function GET() {
  try {
    const foldersBaseDir = path.join(process.cwd(), 'public', 'uploads', 'folders');
    if (!fs.existsSync(foldersBaseDir)) {
      await fs.promises.mkdir(foldersBaseDir, { recursive: true });
    }

    // Query folders from database with files
    const dbFolders = await prisma.mediaFolder.findMany({
      include: {
        files: {
          orderBy: { createdAt: 'desc' },
        },
      },
      orderBy: { updatedAt: 'desc' },
    });

    const folders = dbFolders.map((f) => {
      const totalBytes = f.files.reduce((sum, file) => sum + file.size, 0);
      return {
        id: f.id,
        slug: f.slug,
        name: f.name,
        path: `/uploads/folders/${f.slug}`,
        imageCount: f.files.length,
        totalBytes,
        formattedSize: formatBytes(totalBytes),
        coverImage: f.files.length > 0 ? f.files[0].url : null,
        createdAt: f.createdAt.toISOString(),
        updatedAt: f.updatedAt.toISOString(),
      };
    });

    return NextResponse.json({
      success: true,
      total: folders.length,
      folders,
    });
  } catch (error: any) {
    console.error('List media folders error:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Lỗi khi đọc danh sách thư mục media.' },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { name } = body;

    if (!name || !name.trim()) {
      return NextResponse.json(
        { success: false, error: 'Vui lòng nhập tên thư mục cần tạo.' },
        { status: 400 }
      );
    }

    const trimmedName = name.trim();
    let folderSlug = slugifyFolder(trimmedName);

    // Check if folder slug already exists in DB
    const existing = await prisma.mediaFolder.findUnique({
      where: { slug: folderSlug },
    });

    if (existing) {
      folderSlug = `${folderSlug}-${Date.now().toString().slice(-4)}`;
    }

    // Create physical directory on VPS
    const targetDir = path.join(process.cwd(), 'public', 'uploads', 'folders', folderSlug);
    if (!fs.existsSync(targetDir)) {
      await fs.promises.mkdir(targetDir, { recursive: true });
    }

    // Write metadata
    const metaPath = path.join(targetDir, 'metadata.json');
    const metaData = {
      name: trimmedName,
      slug: folderSlug,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    await fs.promises.writeFile(metaPath, JSON.stringify(metaData, null, 2), 'utf-8');

    // Create MediaFolder record in database
    const newFolder = await prisma.mediaFolder.create({
      data: {
        name: trimmedName,
        slug: folderSlug,
      },
    });

    return NextResponse.json({
      success: true,
      message: `Đã tạo thư mục "${trimmedName}" thành công!`,
      folder: {
        id: newFolder.id,
        slug: newFolder.slug,
        name: newFolder.name,
        path: `/uploads/folders/${newFolder.slug}`,
        imageCount: 0,
        totalBytes: 0,
        formattedSize: '0 B',
        coverImage: null,
        createdAt: newFolder.createdAt.toISOString(),
        updatedAt: newFolder.updatedAt.toISOString(),
      },
    });
  } catch (error: any) {
    console.error('Create media folder error:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Lỗi khi tạo thư mục media.' },
      { status: 500 }
    );
  }
}
