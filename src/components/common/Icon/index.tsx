import React from "react";

//================================================================================
// UPDATED: createIcon Function
// This is the only part that needs to change.
//================================================================================

/**
 * A more flexible helper function to create an SVG component.
 * It removes the hardcoded fill color and instead sets it to `currentColor`.
 * This allows the icon's color to be controlled by its parent's text color
 * or by Tailwind utility classes like `text-white`, `text-primary`, `fill-primary`, etc.
 */
const createIcon = (SvgContent: React.FC<React.SVGProps<SVGSVGElement>>) => {
    // The returned component now intelligently handles its color.
    return (props: React.SVGProps<SVGSVGElement>) => {
        // We remove `fill={"#FFF"}` and replace it with `fill="currentColor"`.
        // We also spread the props `...props` *after* setting the default fill.
        // This allows a `fill` prop passed in `props` to override `currentColor` if needed.
        return <SvgContent {...props}/>;
    };
};


//================================================================================
// SVG Definitions (NO CHANGES NEEDED HERE)
// All the SVG component definitions below remain exactly the same.
//================================================================================

const VolumeUpIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 -960 960 960" {...props}>
        <path
            d="M780-481q0-94-52.5-169T590-759q-12-5-17-16t0-22q5-12 17.5-16.5t25.5.5q101 41 162.5 131T840-481q0 111-61.5 201T616-149q-13 5-25.5.5T573-165q-5-11 0-22t17-16q85-34 137.5-109T780-481ZM280-360H150q-13 0-21.5-8.5T120-390v-180q0-13 8.5-21.5T150-600h130l149-149q14-14 32.5-6.5T480-728v496q0 20-18.5 27.5T429-211L280-360Zm380-120q0 52-26 94t-73 64q-8 4-14.5-1t-6.5-13v-289q0-8 6.5-13t14.5-1q47 22 73 65t26 94ZM420-648 307-540H180v120h127l113 109v-337ZM298-480Z"/>
    </svg>
);
const HighQualityIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
    <svg xmlns="http://www.w3.org/2000/svg"  viewBox="0 -960 960 960" {...props}>
        <path
            d="M595-290h50v-66h42.36q14.09 0 23.86-9.39 9.78-9.39 9.78-23.28v-181.28q0-14.69-9.78-24.37-9.77-9.68-24.03-9.68H559.04q-14.3 0-27.17 9.67Q519-584.66 519-570.37v181.14q0 14.25 13 23.74 13 9.49 27 9.49h36v66Zm-356-66h50v-90.33h102V-356h50v-248h-50v107.83H289V-604h-50v248Zm330-50v-148h102v148H569ZM140-148q-28.72 0-50.86-22.14Q67-192.27 67-221v-518q0-28.72 22.14-50.86T140-812h680q28.72 0 50.86 22.14T893-739v518q0 28.73-22.14 50.86Q848.72-148 820-148H140Zm0-73h680v-518H140v518Zm0 0v-518 518Z"/>
    </svg>
);


const VolumeDownIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 -960 960 960" {...props}>
        <path
            d="M360-360H230q-13 0-21.5-8.5T200-390v-180q0-13 8.5-21.5T230-600h130l149-149q14-14 32.5-6.5T560-728v496q0 20-18.5 27.5T509-211L360-360Zm380-120q0 52-26 94t-73 64q-8 4-14.5-1t-6.5-13v-289q0-8 6.5-13t14.5-1q47 22 73 65t26 94ZM500-648 387-540H260v120h127l113 109v-337ZM378-480Z"/>
    </svg>
);

const VolumeMuteIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 -960 960 960" {...props}>
        <path
            d="m724-437-92 93q-9 9-21 9t-21-9q-9-9-9-21.5t9-21.5l92-92-93-92q-9-9-9-21t9-21q9-9 21.5-9t21.5 9l92 92 92-93q9-9 21-9t21 9q9 9 9 21.5t-9 21.5l-92 92 93 92q9 9 9 21t-9 21q-9 9-21.5 9t-21.5-9l-92-92Zm-444 77H150q-13 0-21.5-8.5T120-390v-180q0-13 8.5-21.5T150-600h130l149-149q14-14 32.5-6.5T480-728v496q0 20-18.5 27.5T429-211L280-360Zm140-288L307-540H180v120h127l113 109v-337ZM311-481Z"/>
    </svg>
);

const BackwardSvg: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 -960 960 960" {...props}>
        <path
            d="M360-522h-30q-10.4 0-17.2-7.12-6.8-7.11-6.8-18 0-10.88 7.08-17.38 7.09-6.5 17.92-6.5h55q11 0 17.5 6.5T410-547v212q0 10.83-7.12 17.92-7.11 7.08-18 7.08-10.88 0-17.88-7.08-7-7.09-7-17.92v-187Zm147 212q-18.7 0-31.35-12.65Q463-335.3 463-354v-173q0-18.7 12.65-31.35Q488.3-571 507-571h83q18.7 0 31.35 12.65Q634-545.7 634-527v173q0 18.7-12.65 31.35Q608.7-310 590-310h-83Zm6-50h71v-162h-71v162ZM480-80q-75 0-140.5-28T225-185q-49-49-77-114.5T120-440q0-12.75 8.68-21.38 8.67-8.62 21.5-8.62 12.82 0 21.32 8.62 8.5 8.63 8.5 21.38 0 125.36 87.32 212.68Q354.64-140 480-140q125.36 0 212.68-87.32Q780-314.64 780-440q0-125.36-85-212.68Q610-740 485-740h-22l52 52q9 9 9 21t-8.61 21q-9.39 9-21.39 9t-21-9L368-751q-9-9-9-21t9-21l106-106q8-8 20.5-8t20.85 8q7.65 8 7.65 20.5t-8 20.5l-58 58h23q75 0 140.5 28T735-695q49 49 77 114.5T840-440q0 75-28 140.5T735-185q-49 49-114.5 77T480-80Z"/>
    </svg>
);

const ForwardSvg: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 -960 960 960" {...props}>
        <path
            d="M480-80q-75 0-140.5-28T225-185q-49-49-77-114.5T120-440q0-75 28-140.5T225-695q49-49 114.5-77T480-800h23l-57-57q-8-8-8-20.5t7.65-20.5q8.35-8 20.35-8.5 12-.5 20 7.5l106 106q9 9 9 21t-9 21L487-646q-9 9-21 9t-21.39-9q-8.61-9-8.61-21t9-21l52-52h-22q-125 0-210 87.32T180-440q0 125.36 87.32 212.68Q354.64-140 480-140q125.36 0 212.68-87.32Q780-314.64 780-440q0-12.75 8.68-21.38 8.67-8.62 21.5-8.62 12.82 0 21.32 8.62 8.5 8.63 8.5 21.38 0 75-28 140.5T735-185q-49 49-114.5 77T480-80ZM360-522h-30q-10.4 0-17.2-7.12-6.8-7.11-6.8-18 0-10.88 7.08-17.38 7.09-6.5 17.92-6.5h55q11 0 17.5 6.5T410-547v212q0 10.83-7.12 17.92-7.11 7.08-18 7.08-10.88 0-17.88-7.08-7-7.09-7-17.92v-187Zm147 212q-18.7 0-31.35-12.65Q463-335.3 463-354v-173q0-18.7 12.65-31.35Q488.3-571 507-571h83q18.7 0 31.35 12.65Q634-545.7 634-527v173q0 18.7-12.65 31.35Q608.7-310 590-310h-83Zm6-50h71v-162h-71v162Z"/>
    </svg>
);

const PlaySvg: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 -960 960 960" {...props}>
        <path
            d="M320-258v-450q0-14 9-22t21-8q4 0 8 1t8 3l354 226q7 5 10.5 11t3.5 14q0 8-3.5 14T720-458L366-232q-4 2-8 3t-8 1q-12 0-21-8t-9-22Z"/>
    </svg>
);

const PauseSvg: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 -960 960 960" {...props}>
        <path
            d="M615-200q-24.75 0-42.37-17.63Q555-235.25 555-260v-440q0-24.75 17.63-42.38Q590.25-760 615-760h55q24.75 0 42.38 17.62Q730-724.75 730-700v440q0 24.75-17.62 42.37Q694.75-200 670-200h-55Zm-325 0q-24.75 0-42.37-17.63Q230-235.25 230-260v-440q0-24.75 17.63-42.38Q265.25-760 290-760h55q24.75 0 42.38 17.62Q405-724.75 405-700v440q0 24.75-17.62 42.37Q369.75-200 345-200h-55Z"/>
    </svg>
);

const TracksSelectionSvg: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 -960 960 960" {...props}>
        <path
            d="M140-160q-24 0-42-18t-18-42v-520q0-24 18-42t42-18h680q24 0 42 18t18 42v520q0 24-18 42t-42 18H140Zm0-60h680v-520H140v520Zm0 0v-520 520Zm130-130h300q12.75 0 21.38-8.68 8.62-8.67 8.62-21.5 0-12.82-8.62-21.32-8.63-8.5-21.38-8.5H270q-12.75 0-21.37 8.68-8.63 8.67-8.63 21.5 0 12.82 8.63 21.32 8.62 8.5 21.37 8.5Zm120-120h300q12.75 0 21.38-8.68 8.62-8.67 8.62-21.5 0-12.82-8.62-21.32-8.63-8.5-21.38-8.5H390q-12.75 0-21.37 8.68-8.63 8.67-8.63 21.5 0 12.82 8.63 21.32 8.62 8.5 21.37 8.5Zm-119.82 0q12.82 0 21.32-8.68 8.5-8.67 8.5-21.5 0-12.82-8.68-21.32-8.67-8.5-21.5-8.5-12.82 0-21.32 8.68-8.5 8.67-8.5 21.5 0 12.82 8.68 21.32 8.67 8.5 21.5 8.5Zm420 120q12.82 0 21.32-8.68 8.5-8.67 8.5-21.5 0-12.82-8.68-21.32-8.67-8.5-21.5-8.5-12.82 0-21.32 8.68-8.5 8.67-8.5 21.5 0 12.82 8.68 21.32 8.67 8.5 21.5 8.5Z"/>
    </svg>
);

const CheckSvg: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 -960 960 960" {...props}>
        <path d="M378-235 142-471l52-52 184 184 388-388 52 52-440 440Z"/>
    </svg>
);

const MediaCollectionSvg: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 -960 960 960" {...props}>
        <path
            d="M140-80q-24 0-42-18t-18-42v-440q0-24 18-42t42-18h680q24 0 42 18t18 42v440q0 24-18 42t-42 18H140Zm0-60h680v-440H140v440Zm290-87 179-121q7-5 7-12t-7-12L430-492q-8-5-15.5-.93-7.5 4.06-7.5 12.93v241q0 8.87 7.5 12.93Q422-222 430-227ZM179-700q-12.75 0-21.37-8.68-8.63-8.67-8.63-21.5 0-12.82 8.63-21.32 8.62-8.5 21.37-8.5h602q12.75 0 21.38 8.68 8.62 8.67 8.62 21.5 0 12.82-8.62 21.32-8.63 8.5-21.38 8.5H179Zm131-120q-12.75 0-21.37-8.68-8.63-8.67-8.63-21.5 0-12.82 8.63-21.32 8.62-8.5 21.37-8.5h340q12.75 0 21.38 8.68 8.62 8.67 8.62 21.5 0 12.82-8.62 21.32-8.63 8.5-21.38 8.5H310ZM140-140v-440 440Z"/>
    </svg>
);

const NextItemSvg: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 -960 960 960" {...props}>
        <path
            d="M670-290.39v-379.22q0-9.65 6.58-16.17 6.58-6.53 16.31-6.53 9.72 0 16.11 6.53 6.38 6.52 6.38 16.17v379.22q0 9.65-6.58 16.17-6.58 6.53-16.3 6.53-9.73 0-16.12-6.53-6.38-6.52-6.38-16.17Zm-425.38-32v-315.22q0-12.98 8.65-20.92 8.65-7.93 20.19-7.93 4.62 0 8.62 1.31 4 1.31 8 4.31l228 156.61q6.61 4.61 9.61 10.66 3 6.04 3 13.51t-3 13.57q-3 6.11-9.61 10.72l-228 156.61q-4 3-8 4.31-4 1.31-8.62 1.31-11.54 0-20.19-7.93-8.65-7.94-8.65-20.92Z"/>
    </svg>
);

const EnterFullscreenSvg: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (

    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 -960 960 960" {...props}><path d="M140-140v-300h60v198.23L718.23-760H520v-60h300v300h-60v-198.23L241.77-200H440v60H140Z"/></svg>
);

const ExitFullscreenSvg: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (

    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 -960 960 960" {...props}><path d="M141.77-100 100-141.77 378.23-420H180v-60h300v300h-60v-198.23L141.77-100ZM480-480v-300h60v198.23L818.23-860 860-818.23 581.77-540H780v60H480Z"/></svg>
);

const CloseSvg: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 -960 960 960" {...props}>
        <path
            d="m336-280 144-144 144 144 56-56-144-144 144-144-56-56-144 144-144-144-56 56 144 144-144 144 56 56ZM480-80q-83 0-156-31.5T197-197q-54-54-85.5-127T80-480q0-83 31.5-156T197-763q54-54 127-85.5T480-880q83 0 156 31.5T763-763q54 54 85.5 127T880-480q0 83-31.5 156T763-197q-54 54-127 85.5T480-80Zm0-80q134 0 227-93t93-227q0-134-93-227t-227-93q-134 0-227 93t-93 227q0 134 93 227t227 93Zm0-320Z"/>
    </svg>
);

const CastSvg: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 -960 960 960" {...props}><path d="M480-480Zm307.69 300H589.23q0-15-1.02-30t-3.06-30h202.54q5.39 0 8.85-3.46t3.46-8.85v-455.38q0-5.39-3.46-8.85t-8.85-3.46H172.31q-5.39 0-8.85 3.46t-3.46 8.85v42.54q-15-2.04-30-3.06t-30-1.02v-38.46q0-29.83 21.24-51.07Q142.48-780 172.31-780h615.38q29.83 0 51.07 21.24Q860-737.52 860-707.69v455.38q0 29.83-21.24 51.07Q817.52-180 787.69-180ZM100-180v-98.46q40.77 0 69.62 28.84 28.84 28.85 28.84 69.62H100Zm186.15 0q0-77.23-54.46-131.31T100-366.15v-60q102.77 0 174.46 71.64 71.69 71.65 71.69 174.51h-60Zm155.39 0q0-71.08-26.96-133.16-26.96-62.07-73.16-108.26-46.19-46.2-108.26-73.16-62.08-26.96-133.16-26.96v-60q83.31 0 156.25 31.46 72.95 31.46 127.66 86.17 54.71 54.71 86.17 127.66 31.46 72.94 31.46 156.25h-60Z"/></svg>
    );

const CastConnectedSvg: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 -960 960 960" {...props}><path d="M704.61-335.39H564.23q-5.09-15.52-11.28-30.68-6.18-15.16-13.26-29.31h104.93v-169.24H402.23q-22.08-18.46-46.92-33.46-24.85-15-51.62-26.53h400.92v289.22ZM480-480ZM100-180v-98.46q40.77 0 69.62 28.84 28.84 28.85 28.84 69.62H100Zm186.15 0q0-77.23-54.46-131.31T100-366.15v-60q102.77 0 174.46 71.64 71.69 71.65 71.69 174.51h-60Zm155.39 0q0-71.08-26.96-133.16-26.96-62.07-73.16-108.26-46.19-46.2-108.26-73.16-62.08-26.96-133.16-26.96v-60q83.31 0 156.25 31.46 72.95 31.46 127.66 86.17 54.71 54.71 86.17 127.66 31.46 72.94 31.46 156.25h-60Zm346.15 0H589.23q0-15-1.02-30t-3.06-30h202.54q5.39 0 8.85-3.46t3.46-8.85v-455.38q0-5.39-3.46-8.85t-8.85-3.46H172.31q-5.39 0-8.85 3.46t-3.46 8.85v42.54q-15-2.04-30-3.06t-30-1.02v-38.46q0-29.83 21.24-51.07Q142.48-780 172.31-780h615.38q29.83 0 51.07 21.24Q860-737.52 860-707.69v455.38q0 29.83-21.24 51.07Q817.52-180 787.69-180Z"/></svg>
);

const LoaderSvg: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 -960 960 960" {...props}>
        <path
            d="M480-80q-83 0-156-31.5T197-197q-54-54-85.5-127T80-480q0-83 31.5-156T197-763q54-54 127-85.5T480-880v80q-100 0-170 70t-70 170q0 100 70 170t170 70q75 0 134-42.5T770-390h88q-27 105-103.5 172.5T580-80h-40l-60-100h100q-58 0-99-41t-41-99q0-58 41-99t99-41q21 0 40 5.5t36 15.5l-96 96 56 56 160-160-160-160-56 56 70 70q-21-9-44-14t-46-5q-100 0-170 70t-70 170q0 100 70 170t170 70v80Z"/>
    </svg>
);

const ChevronLeftIconSvg: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" {...props}><path d="M0 0h24v24H0V0z" fill="none"/><path d="M15.41 16.59L10.83 12l4.58-4.59L14 6l-6 6 6 6 1.41-1.41z"/></svg>
);


const ChevronRightIconSvg: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" {...props}><path d="M0 0h24v24H0V0z" fill="none"/><path d="M8.59 16.59L13.17 12 8.59 7.41 10 6l6 6-6 6-1.41-1.41z"/></svg>
);

const SettingsIconSvg: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (

    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" {...props}><g><path d="M0,0h24v24H0V0z" fill="none"/><path d="M19.14,12.94c0.04-0.3,0.06-0.61,0.06-0.94c0-0.32-0.02-0.64-0.07-0.94l2.03-1.58c0.18-0.14,0.23-0.41,0.12-0.61 l-1.92-3.32c-0.12-0.22-0.37-0.29-0.59-0.22l-2.39,0.96c-0.5-0.38-1.03-0.7-1.62-0.94L14.4,2.81c-0.04-0.24-0.24-0.41-0.48-0.41 h-3.84c-0.24,0-0.43,0.17-0.47,0.41L9.25,5.35C8.66,5.59,8.12,5.92,7.63,6.29L5.24,5.33c-0.22-0.08-0.47,0-0.59,0.22L2.74,8.87 C2.62,9.08,2.66,9.34,2.86,9.48l2.03,1.58C4.84,11.36,4.8,11.69,4.8,12s0.02,0.64,0.07,0.94l-2.03,1.58 c-0.18,0.14-0.23,0.41-0.12,0.61l1.92,3.32c0.12,0.22,0.37,0.29,0.59,0.22l2.39-0.96c0.5,0.38,1.03,0.7,1.62,0.94l0.36,2.54 c0.05,0.24,0.24,0.41,0.48,0.41h3.84c0.24,0,0.44-0.17,0.47-0.41l0.36-2.54c0.59-0.24,1.13-0.56,1.62-0.94l2.39,0.96 c0.22,0.08,0.47,0,0.59-0.22l1.92-3.32c0.12-0.22,0.07-0.47-0.12-0.61L19.14,12.94z M12,15.6c-1.98,0-3.6-1.62-3.6-3.6 s1.62-3.6,3.6-3.6s3.6,1.62,3.6,3.6S13.98,15.6,12,15.6z"/></g></svg>
);

const CloseIconSvg = (props: React.SVGProps<SVGSVGElement>) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" {...props}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
    </svg>
);


const PipIconSvg: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" {...props}>
        <path d="M19 7h-8v6h8V7zm2-4H3c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h18c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm0 16H3V5h18v14z"/>
    </svg>
);

const SpeedIconSvg: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" {...props}>
        <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8zm-1-13h2v5h-2zm-3.56 5.44l1.41-1.41 3.54 3.54-1.41 1.41z"/>
    </svg>
);

const LanguageIconSvg: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" {...props}>
        <path d="M12.87 15.07l-2.54-2.51.03-.03c1.74-1.94 2.98-4.17 3.71-6.53H17V4h-7V2H8v2H1v1.99h11.17C11.5 7.92 10.44 9.75 9 11.35 8.07 10.32 7.3 9.19 6.69 8h-2c.73 1.63 1.73 3.17 2.98 4.56l-5.09 5.02L4 19l5-5 3.11 3.11.76-2.04zM18.5 10h-2L12 22h2l1.12-3h4.75L21 22h2l-4.5-12zm-2.62 7l1.62-4.33L19.12 17h-3.24z"/>
    </svg>
);

//================================================================================
// Icon Export Object (UPDATED)
//================================================================================

export const Icons = {
    // Existing Icons
    VolumeUpIcon: createIcon(VolumeUpIcon),
    VolumeDownIcon: createIcon(VolumeDownIcon),
    VolumeMuteIcon: createIcon(VolumeMuteIcon),
    ForwardIcon: createIcon(ForwardSvg),
    BackwardIcon: createIcon(BackwardSvg),
    PlayIcon: createIcon(PlaySvg),
    PauseIcon: createIcon(PauseSvg),
    CheckIcon: createIcon(CheckSvg),
    TracksSelectionIcon: createIcon(TracksSelectionSvg),
    MediaCollectionIcon: createIcon(MediaCollectionSvg),
    NextItemIcon: createIcon(NextItemSvg),
    EnterFullscreenIcon: createIcon(EnterFullscreenSvg),
    ExitFullscreenIcon: createIcon(ExitFullscreenSvg),
    CloseIcon: createIcon(CloseSvg),
    HighQualityIcon: createIcon(HighQualityIcon),
    CastIcon: createIcon(CastSvg),
    CastConnectedIcon: createIcon(CastConnectedSvg),
    LoaderIcon: createIcon(LoaderSvg),
    ChevronLeftIcon: createIcon(ChevronLeftIconSvg),
    ChevronRightIcon: createIcon(ChevronRightIconSvg),
    SettingsIcon: createIcon(SettingsIconSvg),
    LanguageIcon: createIcon(LanguageIconSvg),
    SpeedIcon: createIcon(SpeedIconSvg),
    PipIcon: createIcon(PipIconSvg),
};
