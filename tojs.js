// year, month, day, hour=12, min=0, sec=0

export function sunPosition(lat, long, date) {
    const pi = Math.PI
    const twopi = 2 * pi;
    const deg2rad = pi / 180;

    const ndate = new Date(date)

    // Get Julian
    function getJulian(date) {
        return (date / 86400000) - (date.getTimezoneOffset() / 1440) + 2440587.5;
    };

    var julian = getJulian(ndate); //get Julian date

    // The input to the Atronomer's almanach is the difference between
    // the Julian date and JD 2451545.0 (noon, 1 January 2000)

    let time = julian - 51545.;
    let hour = ndate.getHours();

    //Mean longitude

    let mnlong = 280.460 + (0.9856474 * time);
    mnlong = mnlong % 360
    if (mnlong < 0) { mnlong = mnlong + 360 };

    // Mean anomaly

    let mnanom = 357.528 + (0.9856474 * time);
    mnanom = mnanom % 360;
    if (mnanom < 0) { mnanom = mnanom + 360 };
    mnanom = mnanom * deg2rad;

    //Ecliptic longitude and obliquity of ecliptic

    let eclong = mnlong + (1.915 * Math.sin(mnanom)) + (0.020 * Math.sin(2 * mnanom))
    eclong = eclong % 360;
    if (eclong < 0) { eclong = eclong + 360 };
    let oblqec = 23.429 - (0.0000004 * time);
    eclong = eclong * deg2rad;
    oblqec = oblqec * deg2rad;

    //Celestial coordinates
    //Right ascension and declination
    let num = Math.cos(oblqec) * Math.sin(eclong);
    let den = Math.cos(eclong);
    let ra = Math.atan(num / den);
    if (den < 0) { ra = ra + pi };
    if (den >= 0 && num < 0) { ra = ra + twopi };
    let dec = Math.asin(Math.sin(oblqec) * Math.sin(eclong));


    //    Local coordinates
    //    Greenwich mean sidereal time
    let gmst = 6.697375 + .0657098242 * time + hour;
    gmst = gmst % 24;
    if (gmst < 0) { gmst = gmst + 24 };

    //    Local mean sidereal time
    let lmst = gmst + (long / 15);
    lmst = lmst % 24.
    if (lmst < 0) { lmst + 24.0 };
    lmst = lmst * 15.0 * deg2rad;

    //Hour angle
    let ha = lmst - ra;
    if (ha < -pi) { ha = ha + twopi };
    if (ha > pi) { ha = ha - twopi };

    // convert degree to radiants 
    lat = lat * deg2rad;

    //Azimuth and elevation
    let el = Math.asin(((Math.sin(dec) * Math.sin(lat)) + (Math.cos(dec) * Math.cos(lat) * Math.cos(ha))));
    let az = Math.asin((-Math.cos(dec) * Math.sin(ha) / Math.cos(el)));


    let cosAzPos;
    let sinAzNeg;
    if (Math.sin(dec) >= 0) { cosAzPos = Math.sin(dec) - Math.sin(el) * Math.sin(lat) }
    if (Math.sin(az) < 0) { sinAzNeg = Math.sin(az) < 0 }
    if (cosAzPos && sinAzNeg) { az = az + twopi }
    if (!cosAzPos) { az = pi - az }

    var result = {
        azimuth: az / deg2rad,
        altitude: el / deg2rad,
        latitude: lat / deg2rad
    }

    return (result)

}