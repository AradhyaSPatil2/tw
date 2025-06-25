"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Checkbox } from "@/components/ui/checkbox"
import { Eye, EyeOff } from "lucide-react"
import Image from "next/image"

export default function LoginPage() {
  const [showPassword, setShowPassword] = useState(false)
  const [username, setUsername] = useState("")
  const [password, setPassword] = useState("")
  const [rememberMe, setRememberMe] = useState(false)

  const getPasswordStrength = (password: string) => {
    if (password.length === 0) return { strength: 0, color: "bg-gray-200", text: "" }
    if (password.length < 4) return { strength: 1, color: "bg-red-500", text: "Weak" }
    if (password.length < 8) return { strength: 2, color: "bg-yellow-500", text: "Fair" }
    if (password.length < 12) return { strength: 3, color: "bg-[#fecc00]", text: "Good" }
    return { strength: 4, color: "bg-[#d7af00]", text: "Strong" }
  }

  const passwordStrength = getPasswordStrength(password)

  const handleLogin = () => {
    if (username && password) {
      localStorage.setItem("isLoggedIn", "true")
      localStorage.setItem("username", username)
      window.location.href = "/dashboard"
    }
  }

  return (
    <div className="min-h-screen bg-white flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Company Logo/Branding */}
        <div className="text-center mb-8">
          <div className="bg-white p-6 rounded-lg mb-4 flex items-center justify-center">
            <Image
              src="/thynkwealth-logo.svg"
              alt="THYNKWEALTH Advisory Services LLP"
              width={200}
              height={80}
              className="object-contain"
            />
          </div>
        </div>

        <Card className="border-[#004360] border-2">
          <CardHeader className="text-center">
            <CardTitle className="text-[#004360] text-2xl">Welcome Back</CardTitle>
            <CardDescription>Sign in to your CRM account</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="username" className="text-[#004360]">
                Username
              </Label>
              <Input
                id="username"
                type="text"
                placeholder="Enter your username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="border-[#004360] focus:border-[#008dd2] focus:ring-[#008dd2]"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="password" className="text-[#004360]">
                Password
              </Label>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="Enter your password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="border-[#004360] focus:border-[#008dd2] focus:ring-[#008dd2] pr-10"
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="absolute right-2 top-1/2 -translate-y-1/2 h-6 w-6 text-[#004360] hover:text-[#008dd2]"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </Button>
              </div>

              {password && (
                <div className="space-y-1">
                  <div className="flex gap-1">
                    {[1, 2, 3, 4].map((level) => (
                      <div
                        key={level}
                        className={`h-2 flex-1 rounded ${
                          level <= passwordStrength.strength ? passwordStrength.color : "bg-gray-200"
                        }`}
                      />
                    ))}
                  </div>
                  <p className="text-xs text-gray-600">Password strength: {passwordStrength.text}</p>
                </div>
              )}
            </div>

            <div className="flex items-center space-x-2">
              <Checkbox
                id="remember"
                checked={rememberMe}
                onCheckedChange={(checked) => setRememberMe(checked as boolean)}
                className="border-[#008dd2] data-[state=checked]:bg-[#008dd2]"
              />
              <Label htmlFor="remember" className="text-sm text-[#004360]">
                Remember me
              </Label>
            </div>

            <Button
              onClick={handleLogin}
              className="w-full bg-[#ef7f1a] hover:bg-[#d16a0f] text-white font-semibold"
              disabled={!username || !password}
            >
              Sign In
            </Button>

            <div className="text-center">
              <a href="#" className="text-[#008dd2] hover:underline text-sm">
                Forgot your password?
              </a>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
