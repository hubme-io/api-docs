"use client"

import { WelcomeSection } from "@/components/welcome-section"
import { GettingStartedSection } from "@/components/getting-started-section"
import { ApiEndpointSection } from "@/components/api-endpoint-section"

interface MainContentProps {
  selectedSection: string
  selectedEndpoint: string | null
}

export function MainContent({ selectedSection, selectedEndpoint }: MainContentProps) {
  return (
    <div className="flex-1 overflow-y-auto h-screen">
      <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 lg:py-8 min-h-full">
        {selectedSection === "welcome" && <WelcomeSection />}
        {selectedSection === "getting-started" && <GettingStartedSection />}
        {selectedSection === "api" && selectedEndpoint && <ApiEndpointSection endpointId={selectedEndpoint} />}
      </div>
    </div>
  )
}
