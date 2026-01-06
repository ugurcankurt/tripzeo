'use client'
import { compressImage } from "@/lib/utils"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { ImagePlus, X, Loader2, GripVertical, Star } from "lucide-react"
import Image from "next/image"
import { toast } from "sonner"
import {
    DndContext,
    closestCenter,
    KeyboardSensor,
    PointerSensor,
    useSensor,
    useSensors,
    DragEndEvent,
} from '@dnd-kit/core';
import {
    arrayMove,
    SortableContext,
    sortableKeyboardCoordinates,
    useSortable,
    rectSortingStrategy,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

interface ImageUploadProps {
    value: (string | File)[]
    onChange: (value: (string | File)[]) => void
    onRemove?: (item: string | File) => void
    disabled?: boolean
}

// Separate component for sortable item to use hooks
function SortableImage({
    item,
    id,
    index,
    onRemove
}: {
    item: string | File
    id: string
    index: number
    onRemove: (item: string | File) => void
}) {
    const {
        attributes,
        listeners,
        setNodeRef,
        transform,
        transition,
        isDragging,
    } = useSortable({ id });

    const style = {
        transform: CSS.Transform.toString(transform),
        transition,
        zIndex: isDragging ? 10 : 1,
        opacity: isDragging ? 0.5 : 1,
    };

    const getPreviewUrl = (item: string | File) => {
        if (typeof item === 'string') return item
        return URL.createObjectURL(item)
    }

    const previewUrl = getPreviewUrl(item)

    return (
        <div
            ref={setNodeRef}
            style={style}
            className="relative w-[200px] h-[200px] rounded-md overflow-hidden bg-muted border group shadow-sm bg-background"
        >
            {/* Drag Handle */}
            <div
                {...attributes}
                {...listeners}
                className="absolute top-2 left-2 z-20 cursor-move p-1 bg-black/50 hover:bg-black/70 rounded text-white opacity-0 group-hover:opacity-100 transition-opacity"
            >
                <GripVertical className="h-4 w-4" />
            </div>

            {/* Remove Button */}
            <div className="z-20 absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                <Button
                    type="button"
                    onClick={(e) => {
                        e.stopPropagation(); // Prevent drag start when clicking remove
                        onRemove(item);
                    }}
                    variant="destructive"
                    size="icon"
                    className="h-6 w-6 rounded-full"
                >
                    <X className="h-3 w-3" />
                </Button>
            </div>

            <Image
                fill
                className="object-cover"
                alt="Image"
                src={previewUrl}
            />

            {/* Cover Photo Badge */}
            {index === 0 && (
                <div className="absolute top-2 left-1/2 -translate-x-1/2 z-20 bg-primary/90 text-primary-foreground text-[10px] px-2 py-0.5 rounded-full font-bold shadow-sm flex items-center gap-1">
                    <Star className="w-3 h-3 fill-current" /> COVER PHOTO
                </div>
            )}

            {/* Number Badge for others */}
            {index > 0 && (
                <div className="absolute top-2 left-1/2 -translate-x-1/2 z-20 bg-black/50 text-white text-[10px] px-2 py-0.5 rounded-full font-medium opacity-0 group-hover:opacity-100 transition-opacity">
                    #{index + 1}
                </div>
            )}


            {typeof item !== 'string' && (
                <div className="absolute bottom-0 left-0 right-0 bg-yellow-500/80 text-white text-xs p-1 text-center font-medium">
                    Pending Upload
                </div>
            )}
        </div>
    )
}

export function ImageUpload({ value, onChange, onRemove, disabled }: ImageUploadProps) {
    const [isProcessing, setIsProcessing] = useState(false)

    const sensors = useSensors(
        useSensor(PointerSensor, {
            activationConstraint: {
                distance: 8, // Require 8px movement before drag starts prevents accidental drags on click
            },
        }),
        useSensor(KeyboardSensor, {
            coordinateGetter: sortableKeyboardCoordinates,
        })
    );

    const onProcessFiles = async (e: React.ChangeEvent<HTMLInputElement>) => {
        try {
            const files = e.target.files
            if (!files || files.length === 0) return

            setIsProcessing(true)
            const processedFiles: File[] = []

            for (const file of Array.from(files)) {
                // Compress and convert to WebP client-side
                const compressedBlob = await compressImage(file)
                const fileName = `${Math.random().toString(36).substring(2)}-${Date.now()}.webp`
                const compressedFile = new File([compressedBlob], fileName, { type: 'image/webp' })
                processedFiles.push(compressedFile)
            }

            onChange([...value, ...processedFiles])
            toast.success("Images added to queue")
        } catch (error) {
            toast.error("Error processing images")
            console.error(error)
        } finally {
            setIsProcessing(false)
        }
    }

    const handleRemove = (item: string | File) => {
        // If it's an uploaded URL, notify parent to handling deletion
        if (typeof item === 'string' && onRemove) {
            onRemove(item)
        }
        // Remove from local state (works for both pending files and cleared URLs)
        onChange(value.filter((current) => current !== item))
    }

    const handleDragEnd = (event: DragEndEvent) => {
        const { active, over } = event;

        if (active.id !== over?.id) {
            const oldIndex = value.findIndex((item) => {
                const id = typeof item === 'string' ? item : (item as any)._dndId || item.name;
                // Since we generate IDs temporarily below, we need a robust match
                // But simplified: map value to IDs, find index
                return getUniqueId(item, value.indexOf(item)) === active.id;
            });

            const newIndex = value.findIndex((item) => {
                return getUniqueId(item, value.indexOf(item)) === over?.id;
            });

            if (oldIndex !== -1 && newIndex !== -1) {
                onChange(arrayMove(value, oldIndex, newIndex));
            }
        }
    };

    // Helper to generate consistent IDs for DnD
    // We use index fallback because file objects might be identical if user uploads same file twice (edge case)
    const getUniqueId = (item: string | File, index: number) => {
        if (typeof item === 'string') return item;
        // For files, attach a temp ID if not present or use name + index
        return `file-${item.name}-${index}`;
    };

    return (
        <div className="mb-4">
            {/* Instructions */}
            <div className="flex items-center justify-between mb-3">
                <p className="text-sm text-muted-foreground">
                    Drag and drop images to reorder. The <strong>first image</strong> will be your cover photo.
                </p>
                <div className="text-sm font-medium">
                    {value.length}/5 required
                </div>
            </div>

            <DndContext
                sensors={sensors}
                collisionDetection={closestCenter}
                onDragEnd={handleDragEnd}
            >
                <SortableContext
                    items={value.map((item, index) => getUniqueId(item, index))}
                    strategy={rectSortingStrategy}
                >
                    <div className="flex items-center gap-4 flex-wrap">
                        {value.map((item, index) => (
                            <SortableImage
                                key={getUniqueId(item, index)}
                                id={getUniqueId(item, index)}
                                item={item}
                                index={index}
                                onRemove={handleRemove}
                            />
                        ))}

                        {/* Upload Button */}
                        <div className="w-[200px] h-[200px] rounded-md border-dashed border-2 flex items-center justify-center bg-muted/30 hover:bg-muted/50 transition cursor-pointer relative group border-primary/20 hover:border-primary/50">
                            <input
                                type="file"
                                multiple
                                accept="image/*"
                                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer disabled:cursor-not-allowed z-10"
                                onChange={onProcessFiles}
                                disabled={disabled || isProcessing}
                            />
                            <div className="flex flex-col items-center gap-2 text-muted-foreground group-hover:text-primary transition-colors">
                                {isProcessing ? (
                                    <Loader2 className="h-8 w-8 animate-spin" />
                                ) : (
                                    <ImagePlus className="h-8 w-8" />
                                )}
                                <span className="text-sm font-medium">
                                    {isProcessing ? "Processing..." : "Add Photos"}
                                </span>
                            </div>
                        </div>
                    </div>
                </SortableContext>
            </DndContext>

            {value.length < 5 && (
                <p className="text-xs text-destructive mt-2 font-medium">
                    * You need at least {5 - value.length} more photo{5 - value.length > 1 ? 's' : ''} to publish.
                </p>
            )}
        </div>
    )
}
