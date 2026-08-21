// Shared page background so Login and Home read as the same product.
//
// Each hue is anchored to its own corner and fades to transparent before it
// reaches the next one. Stacking overlapping blurred layers instead would
// average them toward grey.
export const meshBackground = {
    backgroundColor: '#FAFAFF',
    backgroundImage: [
        'radial-gradient(at 12% 16%, rgba(129, 140, 248, 0.40) 0px, transparent 55%)',
        'radial-gradient(at 88% 10%, rgba(56, 189, 248, 0.34) 0px, transparent 52%)',
        'radial-gradient(at 92% 80%, rgba(244, 114, 182, 0.32) 0px, transparent 55%)',
        'radial-gradient(at 8% 86%, rgba(251, 191, 36, 0.26) 0px, transparent 52%)',
        'radial-gradient(at 50% 55%, rgba(167, 139, 250, 0.18) 0px, transparent 60%)',
    ].join(', '),
};
