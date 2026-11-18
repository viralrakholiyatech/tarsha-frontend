const { BACKEND_URL: application_url } = require("./backend");

module.exports = {
    FileUrl : `${application_url}/public`,
    SvgUrl : `${application_url}/public`,
    host_name : `${application_url}`,
    
    defaultuserpic:"default/DefaultImage.png",
    zaidPdfHeaderPic:'img/logo_dark.png',
    zaidPdfFooterPic:'img/Letterhead(Bottom).jpg',
    zaidPdfHeaderBorder:'img/HeaderBorder.png',

    closeButtonSvg:`${application_url}/svgs/close.svg`,
    eyeButtonSvg:`${application_url}/svgs/eye.svg`, 
    siteinspect :`${application_url}/svgs/siteinspect.svg`

}