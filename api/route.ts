// app/api/route.tsx 
import { NextResponse } from "next/server";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);

  try {
    const apiURL = `https://raw.githubusercontent.com/gitswirl/Quran-Api/refs/heads/main/quran.json`
    const res = await fetch(apiURL, {
      method: "GET",
      headers: {
        "Content-Type": "application/json"
      }
    })
    const data = await res.json()
    let jsondata: any[] = data

    // Dynamically filter data based on query-params
    searchParams.forEach((value, key) => {
      jsondata = jsondata.filter(
        (el) =>
          el[key as keyof any[]] &&
          el[key as keyof any[]]
            .toString()
            .toLowerCase()
            .includes(value.toLowerCase())
      );
    });

    if (jsondata.length > 0) {
      return NextResponse.json(jsondata, { status: 200 });
    } else {
      return NextResponse.json(
        { success: false, message: "No data found matching the criteria!" },
        { status: 404 }
      );
    }
  } catch (error) {
    console.error("Error processing the request: ", error);
    return NextResponse.json(
      { success: false, message: "An error occurred in the server." },
      { status: 500 }
    );
  }
}


