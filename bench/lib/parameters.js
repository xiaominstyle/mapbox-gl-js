const accessToken = (
    process.env.MapboxAccessToken ||
    process.env.MAPBOX_ACCESS_TOKEN ||
    getURLParameter('access_token') ||
    localStorage.getItem('accessToken')
);

const styleURL = (_isStyleBench) => {
    const url = (
        process.env.MapboxStyleURL ||
        process.env.MAPBOX_STYLE_URL ||
        getURLParameter('style_url') ||
        'mapbox://styles/mapbox/streets-v10'
    );

    return _isStyleBench ? url.split(',') : url;
};

localStorage.setItem('accessToken', accessToken);

export { accessToken, styleURL };

function getURLParameter(name) {
    const regexp = new RegExp(`[?&]${name}=([^&#]*)`, 'i');
    const output = regexp.exec(window.location.href);
    return output && output[1];
}
