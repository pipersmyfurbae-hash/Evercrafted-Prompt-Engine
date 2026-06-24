// EC_PALETTE_V1 transforms — the single, deterministic bridge between the
// Color Theme Generator's 7-role output and EC_WR_V2's 60-30-10 palette block.
// Pure functions, no deps. Works in browser and Node.
//
// See ec-palette-v1.md for the schema and the role -> tier mapping rationale.

// Fixed role -> tier map. Change a tier here (one place) to re-bucket a role.
var ROLE_TIERS = {
  primary_bloom:   'dominant_60',
  secondary_bloom: 'secondary_30',
  neutral_base:    'secondary_30',
  foliage:         'greenery',
  accent:          'accent_10',
  contrast:        'accent_10',
  texture:         'accent_10'
};

var ALL_ROLES = Object.keys(ROLE_TIERS);

// Normalize raw Color-Generator output ({ colors: { role: {hex,label,note} }, name, register, mj })
// into a canonical EC_PALETTE_V1 object with tier + greenery tags on every role.
function fromColorGenerator(out) {
  var src = (out && (out.colors || out.roles)) || {};
  var roles = {};
  ALL_ROLES.forEach(function (role) {
    var c = src[role];
    if (!c) return; // defensive: missing role -> simply absent, never crash
    roles[role] = {
      hex: c.hex || null,
      label: c.label || '',
      note: c.note || '',
      tier: ROLE_TIERS[role],
      greenery: ROLE_TIERS[role] === 'greenery',
      elements: c.elements || []
    };
  });
  return {
    schema: 'EC_PALETTE_V1',
    name: (out && out.name) || '',
    register: (out && (out.register || out.archetype)) || '',
    roles: roles,
    mj: (out && out.mj) || ''
  };
}

function _entry(role) {
  return role ? { label: role.label || '', hex: role.hex || null, elements: role.elements || [] } : null;
}

// Derive the EC_WR_V2 palette block (60-30-10 + greenery) from a canonical palette.
// Lossless: accent/contrast/texture collapse into accent_10 with a details[] passthrough.
function toEcWrV2Palette(p) {
  var r = (p && p.roles) || {};
  var details = [];
  ['contrast', 'texture'].forEach(function (k) {
    if (r[k]) details.push({ role: k, hex: r[k].hex, label: r[k].label });
  });
  return {
    primary_60: _entry(r.primary_bloom),
    secondary_30: {
      label: r.secondary_bloom ? r.secondary_bloom.label : (r.neutral_base ? r.neutral_base.label : ''),
      hex: r.secondary_bloom ? r.secondary_bloom.hex : (r.neutral_base ? r.neutral_base.hex : null),
      elements: [].concat(
        (r.secondary_bloom && r.secondary_bloom.elements) || [],
        (r.neutral_base && r.neutral_base.elements) || []
      )
    },
    accent_10: {
      label: r.accent ? r.accent.label : '',
      hex: r.accent ? r.accent.hex : null,
      elements: [].concat(
        (r.accent && r.accent.elements) || [],
        (r.contrast && r.contrast.elements) || [],
        (r.texture && r.texture.elements) || []
      ),
      details: details // contrast + texture preserved, never dropped
    },
    greenery: { palette: r.foliage ? (r.foliage.note || r.foliage.label) : '' }
  };
}

// Optional: flat list for swatch strips / quick rendering, in tier order.
function toSwatchList(p) {
  var r = (p && p.roles) || {};
  return ALL_ROLES
    .filter(function (role) { return r[role]; })
    .map(function (role) {
      return { role: role, tier: r[role].tier, hex: r[role].hex, label: r[role].label };
    });
}

if (typeof module !== 'undefined' && module.exports) {
  module.exports = { ROLE_TIERS, fromColorGenerator, toEcWrV2Palette, toSwatchList };
}
