import {
    Controller,
    Get,
    Post,
    Delete,
    Patch,
    Param,
    Body,
    UseGuards,
    UseInterceptors,
    UploadedFile,
    Res,
    StreamableFile,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { AuthGuard } from '@nestjs/passport';
import { RolesGuard } from '../../guards/roles.guard';
import { Roles } from '../../decorators/roles.decorator';
import { GetUser } from '../../decorators/get-user.decorator';
import { DocumentsService } from './documents.service';
import { UploadDocumentDto, UpdateDocumentDto } from './dto/document.dto';
import { diskStorage } from 'multer';
import { extname } from 'path';
import type { Response } from 'express';
import { createReadStream } from 'fs';

@Controller('documents')
@UseGuards(AuthGuard('jwt'), RolesGuard)
export class DocumentsController {
    constructor(private readonly documentsService: DocumentsService) { }

    @Post('upload')
    @Roles('ADMIN')
    @UseInterceptors(
        FileInterceptor('file', {
            storage: diskStorage({
                destination: './uploads/documents',
                filename: (req, file, cb) => {
                    const randomName = Array(32)
                        .fill(null)
                        .map(() => Math.round(Math.random() * 16).toString(16))
                        .join('');
                    cb(null, `${randomName}${extname(file.originalname)}`);
                },
            }),
            fileFilter: (req, file, cb) => {
                const allowedMimes = [
                    'application/pdf',
                    'application/msword',
                    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
                    'text/plain',
                    'text/markdown',
                ];
                if (allowedMimes.includes(file.mimetype)) {
                    cb(null, true);
                } else {
                    cb(new Error('Invalid file type. Only PDF, DOC, DOCX, TXT, and MD files are allowed.'), false);
                }
            },
            limits: {
                fileSize: 10 * 1024 * 1024, // 10MB
            },
        }),
    )
    async uploadDocument(
        @UploadedFile() file: Express.Multer.File,
        @Body() dto: UploadDocumentDto,
        @GetUser() user: any,
    ) {
        // Parse allowedRoles and tags if they come as strings
        const parsedDto = {
            ...dto,
            allowedRoles: typeof dto.allowedRoles === 'string'
                ? JSON.parse(dto.allowedRoles)
                : dto.allowedRoles,
            tags: dto.tags && typeof dto.tags === 'string'
                ? JSON.parse(dto.tags)
                : dto.tags,
        };

        return this.documentsService.uploadDocument(file, parsedDto, user.userId);
    }

    @Get()
    async getDocuments(@GetUser() user: any) {
        // Admins see all documents, others see only documents they have access to
        const userRole = user.role === 'ADMIN' ? undefined : user.role;
        return this.documentsService.getDocuments(userRole);
    }

    @Get('tags')
    async getTags() {
        return this.documentsService.getDocumentTags();
    }

    @Get(':id')
    async getDocument(@Param('id') id: string, @GetUser() user: any) {
        const userRole = user.role === 'ADMIN' ? undefined : user.role;
        return this.documentsService.getDocumentById(id, userRole);
    }

    @Get(':id/download')
    async downloadDocument(
        @Param('id') id: string,
        @GetUser() user: any,
        @Res({ passthrough: true }) res: Response,
    ) {
        const userRole = user.role === 'ADMIN' ? undefined : user.role;
        const document = await this.documentsService.getDocumentById(id, userRole);

        const file = createReadStream(document.filepath);
        res.set({
            'Content-Type': document.mimetype,
            'Content-Disposition': `attachment; filename="${document.originalName}"`,
        });

        return new StreamableFile(file);
    }

    @Patch(':id')
    @Roles('ADMIN')
    async updateDocument(@Param('id') id: string, @Body() dto: UpdateDocumentDto) {
        return this.documentsService.updateDocument(id, dto);
    }

    @Delete(':id')
    @Roles('ADMIN')
    async deleteDocument(@Param('id') id: string) {
        return this.documentsService.deleteDocument(id);
    }
}
