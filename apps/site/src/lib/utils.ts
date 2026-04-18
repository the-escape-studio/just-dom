import { toast } from "@workspace/ui/lib/utils"

export const copyToClipboard = (text: string, message: string) => {
  try {
    navigator.clipboard.writeText(text)
    toast.success(message)
  } catch {
    toast.error("Error copying text")
  }
}
