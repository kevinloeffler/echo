import { PUBLIC_API_URL } from '$env/static/public';

export async function handleFetch({ event, request, fetch }) {
    // Retrieve the JWT token from cookies
    const jwt = event.cookies.get('Token');

    // If the request is to the API and a JWT exists, add the Authorization header
    if (jwt && request.url.startsWith(PUBLIC_API_URL)) {
        request.headers.set('Authorization', `Bearer ${jwt}`);
    }

    // Proceed with the modified request
    return fetch(request);
}
