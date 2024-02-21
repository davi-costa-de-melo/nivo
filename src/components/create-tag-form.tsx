import { Check, Loader2, X } from 'lucide-react'
import { Button } from './ui/button'
import * as Dialog from '@radix-ui/react-dialog'
import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'
import { useMutation, useQueryClient } from '@tanstack/react-query'

const createTagFormSchema = z.object({
  name: z.string().min(3, 'Minimum 3 characters.'),
})

type CreateTagFormData = z.infer<typeof createTagFormSchema>

export function CreateTagForm() {
  const {
    register,
    handleSubmit,
    watch,
    formState: { isSubmitting, errors },
  } = useForm<CreateTagFormData>({
    resolver: zodResolver(createTagFormSchema),
  })

  const queryClient = useQueryClient()

  const { mutateAsync } = useMutation({
    mutationFn: async ({ name }: CreateTagFormData) => {
      await new Promise((resolve) => setTimeout(resolve, 2000))

      await fetch('http://localhost:3333/tags', {
        method: 'POST',
        body: JSON.stringify({
          name,
          slug,
          amountOfVideos: 0,
        }),
      })
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ['get-tags'],
      })
    },
  })

  function toSlug(text: string): string {
    return text
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .toLowerCase()
      .replace(/[^\w\s]/g, '')
      .replace(/\s+/g, '-')
  }

  const slug = watch('name') ? toSlug(watch('name')) : ''

  async function createTag({ name }: CreateTagFormData) {
    await mutateAsync({ name })
  }

  return (
    <form className="w-full space-y-6" onSubmit={handleSubmit(createTag)}>
      <div className="space-y-2">
        <label htmlFor="name" className="block text-sm font-medium">
          Tag name
        </label>

        <input
          id="name"
          className="w-full rounded-lg border border-zinc-800 bg-zinc-800/50 px-3 py-2.5 text-sm"
          type="text"
          {...register('name')}
        />

        {errors.name && (
          <p className="text-sm text-red-400">{errors.name.message}</p>
        )}
      </div>

      <div className="space-y-2">
        <label htmlFor="slug" className="block text-sm font-medium">
          Slug
        </label>

        <input
          id="slug"
          className="w-full rounded-lg border border-zinc-800 bg-zinc-800/50 px-3 py-2.5 text-sm"
          type="text"
          readOnly
          value={slug}
        />
      </div>

      <div className="flex items-center justify-end gap-2">
        <Dialog.Close asChild>
          <Button>
            <X className="size-3" />
            Cancel
          </Button>
        </Dialog.Close>

        <Button
          type="submit"
          className="bg-teal-400 text-teal-950"
          disabled={isSubmitting}
        >
          {isSubmitting ? (
            <Loader2 className="size-3 animate-spin" />
          ) : (
            <Check className="size-3" />
          )}
          Save
        </Button>
      </div>
    </form>
  )
}
