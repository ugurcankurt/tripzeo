
import { useState, useEffect } from "react"
import { toast } from "sonner"

interface UseLocationProps {
    initialCountry?: string | null
    initialState?: string | null
    initialCity?: string | null
}

export function useLocation({ initialCountry, initialState, initialCity }: UseLocationProps = {}) {
    const [countries, setCountries] = useState<string[]>([])
    const [states, setStates] = useState<string[]>([])
    const [cities, setCities] = useState<string[]>([])

    const [selectedCountry, setSelectedCountry] = useState(initialCountry || "")
    const [selectedState, setSelectedState] = useState(initialState || "")
    const [selectedCity, setSelectedCity] = useState(initialCity || "")

    const [loadingCountries, setLoadingCountries] = useState(true)
    const [loadingStates, setLoadingStates] = useState(false)
    const [loadingCities, setLoadingCities] = useState(false)
    const [hasStates, setHasStates] = useState(false)

    const COUNTRIES_WITH_STATES = ["United States", "Canada", "Australia", "Germany", "India", "Brazil", "Mexico"]

    // Fetch Countries on Mount
    useEffect(() => {
        const fetchCountries = async () => {
            try {
                const response = await fetch('https://countriesnow.space/api/v0.1/countries/iso')
                const data = await response.json()
                if (!data.error) {
                    const countryList = data.data.map((item: any) => item.name).sort()
                    setCountries(countryList)
                }
            } catch (error) {
                console.error("Failed to fetch countries", error)
                toast.error("Failed to load country list.")
            } finally {
                setLoadingCountries(false)
            }
        }
        fetchCountries()
    }, [])

    // Initialize Location Logic (e.g. for Edit Mode)
    useEffect(() => {
        const initLocation = async () => {
            if (initialCountry) {
                const needsState = COUNTRIES_WITH_STATES.includes(initialCountry)
                setHasStates(needsState)

                if (needsState) {
                    setLoadingStates(true)
                    try {
                        const response = await fetch('https://countriesnow.space/api/v0.1/countries/states', {
                            method: 'POST',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify({ country: initialCountry })
                        })
                        const data = await response.json()
                        if (!data.error && data.data.states.length > 0) {
                            setStates(data.data.states.map((s: any) => s.name).sort())
                        }
                    } catch (e) { console.error(e) } finally { setLoadingStates(false) }
                }

                setLoadingCities(true)
                try {
                    const payload = needsState && initialState
                        ? { country: initialCountry, state: initialState }
                        : { country: initialCountry }

                    const endpoint = needsState && initialState
                        ? 'https://countriesnow.space/api/v0.1/countries/state/cities'
                        : 'https://countriesnow.space/api/v0.1/countries/cities'

                    const response = await fetch(endpoint, {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify(payload)
                    })
                    const data = await response.json()
                    if (!data.error) setCities(data.data.sort())

                } catch (e) { console.error(e) } finally { setLoadingCities(false) }
            }
        }

        // Only run if countries are loaded to avoid race conditions (optional, but good practice)
        // Actually, countries loading is separate. We just need initialCountry.
        if (initialCountry) {
            initLocation()
        }
    }, [initialCountry, initialState]) // Dependencies: run when these props change (usually only once on mount/data load)

    const fetchCitiesForCountry = async (country: string) => {
        setLoadingCities(true)
        try {
            const response = await fetch('https://countriesnow.space/api/v0.1/countries/cities', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ country })
            })
            const data = await response.json()
            if (!data.error) setCities(data.data.sort())
        } catch (error) {
            console.error(error)
        } finally {
            setLoadingCities(false)
        }
    }

    const handleCountryChange = async (e: React.ChangeEvent<HTMLSelectElement>) => {
        const country = e.target.value
        setSelectedCountry(country)
        setSelectedState("")
        setSelectedCity("")
        setStates([])
        setCities([])

        const needsState = COUNTRIES_WITH_STATES.includes(country)
        setHasStates(needsState)

        if (country) {
            if (needsState) {
                setLoadingStates(true)
                try {
                    const response = await fetch('https://countriesnow.space/api/v0.1/countries/states', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ country })
                    })
                    const data = await response.json()
                    if (!data.error && data.data.states.length > 0) {
                        setStates(data.data.states.map((s: any) => s.name).sort())
                    } else {
                        setHasStates(false)
                        fetchCitiesForCountry(country)
                    }
                } catch {
                    setHasStates(false)
                    fetchCitiesForCountry(country)
                } finally {
                    setLoadingStates(false)
                }
            } else {
                fetchCitiesForCountry(country)
            }
        }
    }

    const handleStateChange = async (e: React.ChangeEvent<HTMLSelectElement>) => {
        const state = e.target.value
        setSelectedState(state)
        setSelectedCity("")
        setCities([])

        if (state && selectedCountry) {
            setLoadingCities(true)
            try {
                const response = await fetch('https://countriesnow.space/api/v0.1/countries/state/cities', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ country: selectedCountry, state })
                })
                const data = await response.json()
                if (!data.error) setCities(data.data.sort())
            } catch (error) { console.error(error) } finally { setLoadingCities(false) }
        }
    }

    // Direct setters for special cases
    const handleCityChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        setSelectedCity(e.target.value)
    }

    return {
        countries,
        states,
        cities,
        selectedCountry,
        selectedState,
        selectedCity,
        handleCountryChange,
        handleStateChange,
        handleCityChange,
        setSelectedCity,
        loadingCountries,
        loadingStates,
        loadingCities,
        hasStates
    }
}
