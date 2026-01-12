"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { ThumbsUp, ThumbsDown, CheckCircle2 } from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"

export function ArticleFeedback() {
    const [feedback, setFeedback] = useState<"yes" | "no" | null>(null)

    return (
        <div className="mt-12 pt-8 border-t">
            <p className="text-center text-muted-foreground mb-4 font-medium">Was this article helpful?</p>

            <div className="h-12 flex justify-center items-center">
                <AnimatePresence mode="wait">
                    {feedback ? (
                        <motion.div
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -10 }}
                            className="flex items-center gap-2 text-green-600 font-medium"
                        >
                            <CheckCircle2 className="w-5 h-5" />
                            <span>Thank you for your feedback!</span>
                        </motion.div>
                    ) : (
                        <motion.div
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -10 }}
                            className="flex gap-4"
                        >
                            <Button
                                variant="outline"
                                onClick={() => setFeedback("yes")}
                                className="min-w-[100px] gap-2 hover:bg-green-50 hover:text-green-600 hover:border-green-200 transition-all"
                            >
                                <ThumbsUp className="w-4 h-4" />
                                Yes
                            </Button>
                            <Button
                                variant="outline"
                                onClick={() => setFeedback("no")}
                                className="min-w-[100px] gap-2 hover:bg-red-50 hover:text-red-600 hover:border-red-200 transition-all"
                            >
                                <ThumbsDown className="w-4 h-4" />
                                No
                            </Button>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        </div>
    )
}
