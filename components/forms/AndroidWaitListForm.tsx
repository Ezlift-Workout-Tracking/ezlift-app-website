"use client"
import { Card, CardContent } from "@/components/ui/card"

export function AndroidWaitListForm() {
  return (
    <Card className="w-full max-w-4xl mx-auto">
      <CardContent className="p-0">
        <div className="w-full overflow-hidden rounded-lg border">
          <iframe
            src="https://docs.google.com/forms/d/e/1FAIpQLSfpiBp7aF9zVDu62aEWRJunWA9kE8qKcm18cYHEuSrET1K8DQ/viewform?embedded=true"
            width="100%"
            height="550"
            frameBorder="0"
            marginHeight={0}
            marginWidth={0}
            className="w-full"
            title="Android WaitList Form"
          >
            Loading…
          </iframe>
        </div>
      </CardContent>
    </Card>
  )
}
