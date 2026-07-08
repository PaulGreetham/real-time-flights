import { NextResponse } from "next/server"

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const flightNum = searchParams.get("flightNumber")

  if (!flightNum) {
    return NextResponse.json({ error: "Flight number required" }, { status: 400 })
  }

  const apiKey = process.env.AIRLABS_API_KEY
  // AirLabs accepts filtering via flight_iata (e.g. AA123)
  const url = `https://airlabs.co{apiKey}&flight_iata=${flightNum}`

  try {
    const res = await fetch(url)
    const data = await res.json()

    if (!data.response || data.response.length === 0) {
      return NextResponse.json({ error: "Flight not found or currently inactive" }, { status: 404 })
    }

    // Return the first matching live flight object
    return NextResponse.json(data.response[0])
  } catch (error) {
    return NextResponse.json({ error: "Failed fetching aviation data" }, { status: 500 })
  }
}
