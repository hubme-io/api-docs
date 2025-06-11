"use client"

import { useState } from "react"
import { Sidebar } from "@/components/sidebar"
import { MainContent } from "@/components/main-content"
import { TokenProvider } from "@/components/token-provider"
import { ApiSpecProvider } from "@/components/api-spec-provider"
import { MobileSidebar } from "@/components/mobile-sidebar"

export default function ApiDocsPage() {
  const [selectedSection, setSelectedSection] = useState("welcome")
  const [selectedEndpoint, setSelectedEndpoint] = useState<string | null>(null)
  const [sidebarOpen, setSidebarOpen] = useState(false)

  return (
    <TokenProvider>
      <ApiSpecProvider>
        <div className="flex min-h-screen h-screen bg-gray-50">
          {/* Desktop Sidebar */}
          <div className="hidden lg:block h-full">
            <Sidebar
              selectedSection={selectedSection}
              selectedEndpoint={selectedEndpoint}
              onSectionSelect={setSelectedSection}
              onEndpointSelect={setSelectedEndpoint}
            />
          </div>

          {/* Mobile Sidebar */}
          <MobileSidebar
            selectedSection={selectedSection}
            selectedEndpoint={selectedEndpoint}
            onSectionSelect={setSelectedSection}
            onEndpointSelect={setSelectedEndpoint}
            isOpen={sidebarOpen}
            onClose={() => setSidebarOpen(false)}
          />

          {/* Main Content Area */}
          <div className="flex-1 flex flex-col min-w-0 h-full">
            {/* Mobile Header */}
            <div className="lg:hidden bg-white border-b border-gray-200 px-4 py-3">
              <div className="flex items-center justify-between">
                <button
                  onClick={() => setSidebarOpen(true)}
                  className="p-2 rounded-md text-gray-600 hover:text-gray-900 hover:bg-gray-100"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                  </svg>
                </button>
                <h1 className="text-lg font-semibold text-gray-900">Managefy API</h1>
                <div className="w-10" /> {/* Spacer for centering */}
              </div>
            </div>

            {/* Content */}
            <MainContent selectedSection={selectedSection} selectedEndpoint={selectedEndpoint} />
          </div>
        </div>
      </ApiSpecProvider>
    </TokenProvider>
  )
}
