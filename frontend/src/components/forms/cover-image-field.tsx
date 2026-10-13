"use client";

import { useMutation } from "@tanstack/react-query";
import { ImagePlusIcon, LoaderCircleIcon, RefreshCwIcon } from "lucide-react";
import Image from "next/image";
import { useId, useRef, useState, type DragEvent } from "react";
import type { FieldError as FormFieldError } from "react-hook-form";

import { IMAGE_CONTENT_TYPES, IMAGE_MAX_BYTES } from "@contracts/image";

import { Button } from "@/components/ui/button";
import { Field, FieldError, FieldLabel } from "@/components/ui/field";
import { api, getImageUrl } from "@/lib/api";
import { compressImage } from "@/lib/compress-image";

interface CoverImageFieldProps {
  value: string | undefined;
  onChange: (imageId: string) => void;
  error?: FormFieldError | undefined;
}

export function CoverImageField({ value, onChange, error }: CoverImageFieldProps) {
  const inputId = useId();
  const inputRef = useRef<HTMLInputElement>(null);
  const [dragging, setDragging] = useState(false);

  const upload = useMutation({
    mutationFn: async (file: File) => {
      if (!IMAGE_CONTENT_TYPES.some((type) => type === file.type)) {
        throw new Error("Use a JPEG, PNG or WebP image");
      }
      const compressed = await compressImage(file);
      if (compressed.size > IMAGE_MAX_BYTES) {
        throw new Error("That image is too large even after compression");
      }
      return api.uploadImage(compressed);
    },
    onSuccess: ({ _id }) => onChange(_id),
  });

  const pick = (file: File | undefined) => {
    if (file) upload.mutate(file);
  };

  const onDrop = (event: DragEvent<HTMLLabelElement>) => {
    event.preventDefault();
    setDragging(false);
    pick(event.dataTransfer.files[0]);
  };

  const message = upload.error?.message ?? error?.message;

  return (
    <Field data-invalid={message !== undefined}>
      <FieldLabel htmlFor={inputId}>Cover photo</FieldLabel>
      <input
        ref={inputRef}
        id={inputId}
        type="file"
        accept={IMAGE_CONTENT_TYPES.join(",")}
        className="sr-only"
        onChange={(event) => {
          pick(event.target.files?.[0]);
          event.target.value = "";
        }}
      />
      <label
        htmlFor={inputId}
        onDragOver={(event) => {
          event.preventDefault();
          setDragging(true);
        }}
        onDragLeave={() => setDragging(false)}
        onDrop={onDrop}
        className={`relative flex aspect-video cursor-pointer items-center justify-center overflow-hidden rounded-xl border border-dashed transition-colors ${
          dragging ? "border-info bg-info/10" : "hover:bg-muted/50"
        } ${message ? "border-destructive" : ""}`}
      >
        {value && <Image src={getImageUrl(value)} alt="Cover preview" fill unoptimized className="object-cover" />}
        {upload.isPending ? (
          <span className="relative flex items-center gap-2 rounded-md bg-background/80 px-3 py-1.5 text-sm">
            <LoaderCircleIcon className="size-4 animate-spin" /> Uploading…
          </span>
        ) : (
          !value && (
            <span className="flex flex-col items-center gap-2 text-center text-sm text-muted-foreground">
              <ImagePlusIcon className="size-6" />
              <span>
                <span className="font-medium text-foreground">Click to upload</span> or drag a photo here
              </span>
              <span className="text-xs">JPEG, PNG or WebP · shown at 16:9</span>
            </span>
          )
        )}
      </label>
      {value && !upload.isPending && (
        <Button type="button" variant="outline" size="sm" className="self-start" onClick={() => inputRef.current?.click()}>
          <RefreshCwIcon /> Replace photo
        </Button>
      )}
      <FieldError>{message}</FieldError>
    </Field>
  );
}
