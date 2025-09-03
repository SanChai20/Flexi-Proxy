import { useState, useCallback } from 'react'

export function useAsyncFn<T, Args extends any[]>(
    fn: (...args: Args) => Promise<T>
) {
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState<Error | null>(null)
    const [data, setData] = useState<T | null>(null)

    const execute = useCallback(async (...args: Args) => {
        setLoading(true)
        setError(null)
        try {
            const result = await fn(...args)
            setData(result)
            return result
        } catch (err) {
            setError(err as Error)
            throw err
        } finally {
            setLoading(false)
        }
    }, [fn])

    return { execute, loading, error, data }
}