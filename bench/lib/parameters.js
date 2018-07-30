const isStyleBench = process.env.STYLE_BENCHMARK;

const accessToken = (
    process.env.MapboxAccessToken ||
    process.env.MAPBOX_ACCESS_TOKEN ||
    getURLParameter('access_token') ||
    localStorage.getItem('accessToken')
);

let styleURL = (
    process.env.MapboxStyleURL ||
    process.env.MAPBOX_STYLE_URL ||
    getURLParameter('style_url')
);

const defaultURL = 'mapbox://styles/mapbox/streets-v10';

if (isStyleBench) {
    // local storage coerces a null value to a string so if that happens, fall back to a default style url
    styleURL = !styleURL || styleURL === 'null' ? [defaultURL] : styleURL.split(',');
} else {
    styleURL = defaultURL;
}

localStorage.setItem('accessToken', accessToken);

export { accessToken, styleURL, isStyleBench };

function getURLParameter(name) {
    const regexp = new RegExp(`[?&]${name}=([^&#]*)`, 'i');
    const output = regexp.exec(window.location.href);
    return output && output[1];
}
