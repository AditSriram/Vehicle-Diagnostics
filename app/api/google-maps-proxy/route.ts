import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    // Get the URL from the query parameter
    const url = request.nextUrl.searchParams.get('url');
    
    if (!url) {
      return NextResponse.json({ error: 'URL parameter is required' }, { status: 400 });
    }
    
    // Make the request to the Google Maps API
    const response = await fetch(url);
    
    // Return the response as JSON
    const data = await response.json();
    
    // Check for Google API errors
    if (data.status && data.status !== 'OK' && data.status !== 'ZERO_RESULTS') {
      console.error('Google Maps API error:', data.status, data.error_message);
      
      // Provide helpful response based on the error
      if (data.status === 'REQUEST_DENIED') {
        return NextResponse.json({ 
          status: 'REQUEST_DENIED', 
          error: 'The Google Maps API request was denied. This could be due to an invalid API key or missing API permissions.', 
          message: data.error_message || 'API request denied' 
        }, { status: 403 });
      }
      
      // For other error types
      return NextResponse.json({ 
        status: data.status, 
        error: 'Google Maps API error', 
        message: data.error_message || 'Unknown error' 
      }, { status: 500 });
    }
    
    return NextResponse.json(data);
    
  } catch (error) {
    console.error('Proxy error:', error);
    return NextResponse.json({ error: 'Failed to proxy request' }, { status: 500 });
  }
}

// We'll allow this to be a dynamic API route
export const dynamic = 'force-dynamic'; 