// api/[...slug]/route.tsx
import { NextResponse } from "next/server";
import { languagesArray } from "./LangArray";
interface paramsType {
  params: { slug: string[] };
}

export async function GET(request: Request, { params }: paramsType) {
  const [langName__param, langVersion__param, chapter__param] = params.slug;

  // getting version-file requested in slug
  const langVersion =
    langVersion__param === "orignal"
      ? "array"
      : langVersion__param === "latin"
        ? "array_la"
        : langVersion__param === "latin-diacritical"
          ? "array_lad"
          : `${langVersion__param}`;

  try {
    const langName__Exist = languagesArray.find(
      (item) => item === langName__param || langName__param == item
    );
    if (!langName__Exist) {
      return NextResponse.json({
        status: 404, sucess: false,
        message: `No data found for specefic ${langName__param} language!`
      }, { status: 404 })

    } else if (langName__Exist && !langVersion__param) {
      return NextResponse.json({
        status: 401, sucess: false,
        message: [
          `please specify ${langName__param} language version as well;`,
          `for-example: ${langName__param}/orignal , ${langName__param}/latin , ${langName__param}/latin-diacritical`
        ]
      }, { status: 401 })
    }

    try {
      const apiURL = `https://raw.githubusercontent.com/gitswirl/Quran-Api/refs/heads/main/edition/${langName__param}/${langVersion}.json`
      const res = await fetch(apiURL, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          "x-api-key": process.env.API_KEY || ""
        },
        cache: "no-store"
      });
      const data = await res.json();
      let jsondata: any[] = data;

      // chapter target --
      if (chapter__param) {
        const chapter = jsondata.find(elem => (
          elem.chapter === chapter__param || chapter__param == elem.chapter
        ))
        if (!chapter) return NextResponse.json({
          status: 404,
          sucess: false,
          message: `${chapter__param} doesn't exist try between 1 & 114`,
        }, { status: 404 });

        return NextResponse.json([{ ...chapter }], { status: 200 });
      }
      return NextResponse.json(jsondata, { status: 200 });

    } catch (err) {
      console.error("some erorr occur!:", err)
      return NextResponse.json({
        status: 404,
        sucess: false,
        message: [
          `No data found for specefic ${langName__param} language ${langVersion__param} version!`,
          `try ${langName__param}/orignal , ${langName__param}/latin or ${langName__param}/latin-diacritical`
        ]
      }, { status: 404 })
    }

  } catch (error) {
    console.error(error);
    return NextResponse.json({
      status: 500,
      sucess: false,
      message: "some server erorr! try again later."
    }, {
      status: 500
    })
  }
}

// Optional: Use a database (like MongoDB or PostgreSQL) for handling large datasets
// Alternatively, use caching strategies (Redis or similar) to store and serve frequestuently queried data

// Config to use Edge functions or Node.js serverless function to prevent request.url bug
// for next-js under version 14 --
// export const config = {
//   runtime: "edge", // Adjust this based on your needs, 'nodejs' might be a better fit for large data
// };

// for next-js version 14+ --
// Updated configuration for Next.js 14
// export const runtime = "edge";
