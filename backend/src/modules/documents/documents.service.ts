import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma.service';
import { Role } from '@prisma/client';
import { UploadDocumentDto, UpdateDocumentDto } from './dto/document.dto';
import * as fs from 'fs';
import * as path from 'path';

@Injectable()
export class DocumentsService {
    constructor(private prisma: PrismaService) { }

    async uploadDocument(
        file: Express.Multer.File,
        dto: UploadDocumentDto,
        uploaderId: string,
    ) {
        const document = await this.prisma.client.document.create({
            data: {
                filename: file.filename,
                originalName: file.originalname,
                filepath: file.path,
                filesize: file.size,
                mimetype: file.mimetype,
                description: dto.description,
                allowedRoles: dto.allowedRoles,
                tags: dto.tags || [],
                uploadedBy: uploaderId,
            },
            include: {
                uploader: {
                    select: {
                        id: true,
                        username: true,
                        firstName: true,
                        lastName: true,
                    },
                },
            },
        });

        return document;
    }

    async getDocuments(userRole?: Role) {
        const where = userRole
            ? {
                allowedRoles: {
                    has: userRole,
                },
            }
            : {};

        return this.prisma.client.document.findMany({
            where,
            include: {
                uploader: {
                    select: {
                        id: true,
                        username: true,
                        firstName: true,
                        lastName: true,
                    },
                },
            },
            orderBy: {
                createdAt: 'desc',
            },
        });
    }

    async getDocumentById(id: string, userRole?: Role) {
        const document = await this.prisma.client.document.findUnique({
            where: { id },
            include: {
                uploader: {
                    select: {
                        id: true,
                        username: true,
                        firstName: true,
                        lastName: true,
                    },
                },
            },
        });

        if (!document) {
            throw new NotFoundException('Document not found');
        }

        // Check if user has access to this document
        if (userRole && !document.allowedRoles.includes(userRole)) {
            throw new NotFoundException('Document not found');
        }

        return document;
    }

    async updateDocument(id: string, dto: UpdateDocumentDto) {
        const document = await this.prisma.client.document.findUnique({
            where: { id },
        });

        if (!document) {
            throw new NotFoundException('Document not found');
        }

        return this.prisma.client.document.update({
            where: { id },
            data: {
                description: dto.description,
                allowedRoles: dto.allowedRoles,
                tags: dto.tags,
            },
            include: {
                uploader: {
                    select: {
                        id: true,
                        username: true,
                        firstName: true,
                        lastName: true,
                    },
                },
            },
        });
    }

    async deleteDocument(id: string) {
        const document = await this.prisma.client.document.findUnique({
            where: { id },
        });

        if (!document) {
            throw new NotFoundException('Document not found');
        }

        // Delete file from filesystem
        try {
            if (fs.existsSync(document.filepath)) {
                fs.unlinkSync(document.filepath);
            }
        } catch (error) {
            console.error('Error deleting file:', error);
        }

        // Delete from database
        await this.prisma.client.document.delete({
            where: { id },
        });

        return { message: 'Document deleted successfully' };
    }

    async getDocumentTags() {
        return this.prisma.client.documentTag.findMany({
            orderBy: {
                displayName: 'asc',
            },
        });
    }

    async createTag(name: string, displayName: string, description?: string, category?: string) {
        return this.prisma.client.documentTag.create({
            data: {
                name,
                displayName,
                description,
                category,
            },
        });
    }
}
