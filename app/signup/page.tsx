"use client"

import { Button } from "@/components/ui/button"
import {
    Card,
    CardAction,
    CardContent,
    CardDescription,
    CardFooter,
    CardHeader,
    CardTitle,
} from "@/components/ui/card"
import { useForm } from "react-hook-form"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useRouter } from "next/navigation"

type SignupFormValues = {
    name: string
    email: string
    password: string
    confirmPassword: string
}

export function Signup() {
    const router = useRouter()
    const {
        register,
        handleSubmit,
        setError,
        getValues,
        formState: { errors, isSubmitting },
    } = useForm<SignupFormValues>()

    async function onSubmit(values: SignupFormValues) {
        try {
            const response = await fetch("/api/signup", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    name: values.name,
                    email: values.email,
                    password: values.password,
                }),
            })
            const result = await response.json()

            if (!response.ok) {
                setError("root", { message: result.error ?? "Unable to create your account" })
                return
            }

            router.push(["ADMIN", "STAFF"].includes(result.user.role) ? "/dashboard" : "/")
            router.refresh()
        } catch {
            setError("root", { message: "Something went wrong. Please try again." })
        }
    }

    return (
        <Card className="w-full max-w-sm">
            <CardHeader>
                <CardTitle>Create an account</CardTitle>
                <CardDescription>
                    Enter your details to create your account
                </CardDescription>
                <CardAction>
                    <Button variant="link" type="button" onClick={() => router.push("/login")}>
                        Log in
                    </Button>
                </CardAction>
            </CardHeader>
            <form onSubmit={handleSubmit(onSubmit)}>
                <CardContent>
                    <div className="flex flex-col gap-6">
                        <div className="grid gap-2">
                            <Label htmlFor="name">Name</Label>
                            <Input
                                id="name"
                                type="text"
                                placeholder="John Doe"
                                autoComplete="name"
                                aria-invalid={Boolean(errors.name)}
                                {...register("name", {
                                    required: "Name is required",
                                    minLength: { value: 2, message: "Name must be at least 2 characters" },
                                    maxLength: { value: 80, message: "Name must be 80 characters or fewer" },
                                })}
                            />
                            {errors.name && <p className="text-sm text-destructive">{errors.name.message}</p>}
                        </div>
                        <div className="grid gap-2">
                            <Label htmlFor="email">Email</Label>
                            <Input
                                id="email"
                                type="email"
                                placeholder="m@example.com"
                                autoComplete="email"
                                aria-invalid={Boolean(errors.email)}
                                {...register("email", {
                                    required: "Email is required",
                                    pattern: {
                                        value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
                                        message: "Enter a valid email address",
                                    },
                                })}
                            />
                            {errors.email && <p className="text-sm text-destructive">{errors.email.message}</p>}
                        </div>
                        <div className="grid gap-2">
                            <Label htmlFor="password">Password</Label>
                            <Input
                                id="password"
                                type="password"
                                autoComplete="new-password"
                                aria-invalid={Boolean(errors.password)}
                                {...register("password", {
                                    required: "Password is required",
                                    minLength: { value: 8, message: "Password must be at least 8 characters" },
                                    maxLength: { value: 72, message: "Password must be 72 characters or fewer" },
                                })}
                            />
                            {errors.password && <p className="text-sm text-destructive">{errors.password.message}</p>}
                        </div>
                        <div className="grid gap-2">
                            <Label htmlFor="confirm-password">Confirm password</Label>
                            <Input
                                id="confirm-password"
                                type="password"
                                autoComplete="new-password"
                                aria-invalid={Boolean(errors.confirmPassword)}
                                {...register("confirmPassword", {
                                    required: "Please confirm your password",
                                    validate: (password) => password === getValues("password") || "Passwords do not match",
                                })}
                            />
                            {errors.confirmPassword && <p className="text-sm text-destructive">{errors.confirmPassword.message}</p>}
                        </div>
                        {errors.root && (
                            <p role="alert" className="text-sm text-destructive">
                                {errors.root.message}
                            </p>
                        )}
                    </div>
                </CardContent>
                <CardFooter className="flex-col gap-2">
                    <Button type="submit" className="w-full" disabled={isSubmitting}>
                        {isSubmitting ? "Creating account..." : "Create account"}
                    </Button>
                </CardFooter>
            </form>
        </Card>
    )
}

export default Signup