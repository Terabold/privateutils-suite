import AdBox from "./AdBox";

const StickyAnchorAd = () => {
  return (
    <div 
      id="mobile-anchor-ad"
      className="fixed bottom-0 left-0 right-0 z-50 flex min-[1600px]:hidden justify-center bg-black/80 backdrop-blur-sm border-t border-white/10 py-2 h-[66px] min-h-[66px] overflow-hidden"
      style={{
        contain: 'layout size',
        minWidth: '320px'
      }}
    >
      <AdBox adFormat="horizontal" height={50} label="320x50 ANCHOR AD" className="w-full" />
    </div>
  );
};

export default StickyAnchorAd;
