"use client"

import React from "react"

import { useState } from "react"
import axios from "axios"
import { FileUp, Send, Upload, X } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Alert, AlertDescription } from "@/components/ui/alert"

function formatFileSize(bytes) {
  if (bytes === 0) return "0 Bytes"

  const k = 1024
  const sizes = ["Bytes", "KB", "MB", "GB"]
  const i = Math.floor(Math.log(bytes) / Math.log(k))

  return Number.parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i]
}

export default function FileUpload() {
  const [rollNumber, setRollNumber] = useState("")
  const [collegeEmail, setCollegeEmail] = useState("")
  const [files, setFiles] = useState([])
  const [message, setMessage] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [isSuccess, setIsSuccess] = useState(false)
  const [isError, setIsError] = useState(false)

  const totalFileSize = files.reduce((total, file) => total + file.size, 0)

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!rollNumber || !collegeEmail || files.length === 0) {
      setMessage("All fields are required")
      setIsError(true)
      setIsSuccess(false)
      return
    }

    setIsLoading(true)
    setIsError(false)
    setIsSuccess(false)

    const formData = new FormData()
    formData.append("rollNumber", rollNumber)
    formData.append("collegeEmail", collegeEmail)
    for (const file of files) {
      formData.append("files", file)
    }

    try {
      const res = await axios.post("http://localhost:5000/send-email", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      })
      setMessage(res.data.message)
      setIsSuccess(true)
      setIsError(false)
    } catch (error) {
      setMessage("Error sending files")
      setIsError(true)
      setIsSuccess(false)
    } finally {
      setIsLoading(false)
    }
  }

  const handleFileChange = (e) => {
    if (e.target.files) {
      setFiles(Array.from(e.target.files))
    }
  }

  const removeFile = (indexToRemove) => {
    setFiles(files.filter((_, index) => index !== indexToRemove))
  }

  const handleDragOver = (e) => {
    e.preventDefault()
    e.stopPropagation()
  }

  const handleDrop = (e) => {
    e.preventDefault()
    e.stopPropagation()

    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      setFiles(Array.from(e.dataTransfer.files))
    }
  }

  return (
    <div className="flex justify-center items-center min-h-screen bg-gray-50 p-4">
      <Card className="w-full max-w-md shadow-lg">
        <CardHeader className="space-y-1">
          <CardTitle className="text-2xl font-bold text-center">Send Lab Work</CardTitle>
          <CardDescription className="text-center">Upload and send your lab assignments</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="rollNumber">Roll Number</Label>
              <Input
                id="rollNumber"
                type="text"
                placeholder="Enter your roll number"
                value={rollNumber}
                onChange={(e) => setRollNumber(e.target.value)}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="collegeEmail">College Email</Label>
              <Input
                id="collegeEmail"
                type="email"
                placeholder="Enter your college email"
                value={collegeEmail}
                onChange={(e) => setCollegeEmail(e.target.value)}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="files">Upload Files</Label>
              <div
                className="border-2 border-dashed border-gray-300 rounded-lg p-6 transition-colors hover:border-primary/50 cursor-pointer"
                onDragOver={handleDragOver}
                onDrop={handleDrop}
                onClick={() => document.getElementById("files")?.click()}
              >
                <div className="flex flex-col items-center justify-center gap-2">
                  <Upload className="h-8 w-8 text-gray-400" />
                  <p className="text-sm text-gray-500">Drag and drop files here or click to browse</p>
                  <Input
                    id="files"
                    type="file"
                    multiple
                    className="hidden"
                    onChange={handleFileChange}
                    onClick={(e) => e.stopPropagation()}
                  />
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={(e) => {
                      e.stopPropagation()
                      document.getElementById("files")?.click()
                    }}
                  >
                    <FileUp className="mr-2 h-4 w-4" />
                    Select Files
                  </Button>
                </div>
              </div>
              {files.length > 0 && (
                <div className="mt-2">
                  <div className="flex justify-between items-center">
                    <p className="text-sm font-medium">Selected files ({files.length})</p>
                    <p className="text-sm text-gray-500">Total: {formatFileSize(totalFileSize)}</p>
                  </div>
                  <ul className="text-sm text-gray-500 mt-1 max-h-40 overflow-y-auto">
                    {files.map((file, index) => (
                      <li
                        key={index}
                        className="flex justify-between items-center py-1 px-2 border-b border-gray-100 last:border-0 hover:bg-gray-50 rounded"
                      >
                        <span className="truncate max-w-[60%]">{file.name}</span>
                        <div className="flex items-center gap-2">
                          <span className="text-xs text-gray-400">{formatFileSize(file.size)}</span>
                          <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            className="h-6 w-6 rounded-full hover:bg-red-50 hover:text-red-500"
                            onClick={(e) => {
                              e.stopPropagation()
                              removeFile(index)
                            }}
                          >
                            <X className="h-3 w-3" />
                            <span className="sr-only">Remove {file.name}</span>
                          </Button>
                        </div>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>

            {message && (
              <Alert
                className={
                  isSuccess
                    ? "bg-green-50 text-green-800 border-green-200"
                    : isError
                      ? "bg-red-50 text-red-800 border-red-200"
                      : ""
                }
              >
                <AlertDescription>{message}</AlertDescription>
              </Alert>
            )}
          </form>
        </CardContent>
        <CardFooter>
          <Button className="w-full" onClick={handleSubmit} disabled={isLoading}>
            {isLoading ? (
              <>
                <svg
                  className="animate-spin -ml-1 mr-2 h-4 w-4 text-white"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  ></path>
                </svg>
                Processing...
              </>
            ) : (
              <>
                <Send className="mr-2 h-4 w-4" />
                Send Files
              </>
            )}
          </Button>
        </CardFooter>
      </Card>
    </div>
  )
}

