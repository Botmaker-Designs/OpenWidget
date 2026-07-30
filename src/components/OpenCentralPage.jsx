import { useState, useEffect } from 'react'

const FONT = '"Plus Jakarta Sans", -apple-system, BlinkMacSystemFont, sans-serif'
const EASING = 'cubic-bezier(0.16, 1, 0.3, 1)'

// Official brand marks (path data from simple-icons, CC0). Salesforce, Slack, Freshdesk
// and Pipedrive have no redistributable mark available, so those fall back to a plain
// initials badge wherever they're referenced below.
const BRAND_ICONS = {
  zendesk: { hex: '#03363D', path: 'M12.914 2.904V16.29L24 2.905H12.914zM0 2.906C0 5.966 2.483 8.45 5.543 8.45s5.542-2.484 5.543-5.544H0zm11.086 4.807L0 21.096h11.086V7.713zm7.37 7.84c-3.063 0-5.542 2.48-5.542 5.543H24c0-3.06-2.48-5.543-5.543-5.543z' },
  hubspot: { hex: '#FF7A59', path: 'M18.164 7.93V5.084a2.198 2.198 0 001.267-1.978v-.067A2.2 2.2 0 0017.238.845h-.067a2.2 2.2 0 00-2.193 2.193v.067a2.196 2.196 0 001.252 1.973l.013.006v2.852a6.22 6.22 0 00-2.969 1.31l.012-.01-7.828-6.095A2.497 2.497 0 104.3 4.656l-.012.006 7.697 5.991a6.176 6.176 0 00-1.038 3.446c0 1.343.425 2.588 1.147 3.607l-.013-.02-2.342 2.343a1.968 1.968 0 00-.58-.095h-.002a2.033 2.033 0 102.033 2.033 1.978 1.978 0 00-.1-.595l.005.014 2.317-2.317a6.247 6.247 0 104.782-11.134l-.036-.005zm-.964 9.378a3.206 3.206 0 113.215-3.207v.002a3.206 3.206 0 01-3.207 3.207z' },
  whatsapp: { hex: '#25D366', path: 'M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z' },
  instagram: { hex: '#FF0069', path: 'M7.0301.084c-1.2768.0602-2.1487.264-2.911.5634-.7888.3075-1.4575.72-2.1228 1.3877-.6652.6677-1.075 1.3368-1.3802 2.127-.2954.7638-.4956 1.6365-.552 2.914-.0564 1.2775-.0689 1.6882-.0626 4.947.0062 3.2586.0206 3.6671.0825 4.9473.061 1.2765.264 2.1482.5635 2.9107.308.7889.72 1.4573 1.388 2.1228.6679.6655 1.3365 1.0743 2.1285 1.38.7632.295 1.6361.4961 2.9134.552 1.2773.056 1.6884.069 4.9462.0627 3.2578-.0062 3.668-.0207 4.9478-.0814 1.28-.0607 2.147-.2652 2.9098-.5633.7889-.3086 1.4578-.72 2.1228-1.3881.665-.6682 1.0745-1.3378 1.3795-2.1284.2957-.7632.4966-1.636.552-2.9124.056-1.2809.0692-1.6898.063-4.948-.0063-3.2583-.021-3.6668-.0817-4.9465-.0607-1.2797-.264-2.1487-.5633-2.9117-.3084-.7889-.72-1.4568-1.3876-2.1228C21.2982 1.33 20.628.9208 19.8378.6165 19.074.321 18.2017.1197 16.9244.0645 15.6471.0093 15.236-.005 11.977.0014 8.718.0076 8.31.0215 7.0301.0839m.1402 21.6932c-1.17-.0509-1.8053-.2453-2.2287-.408-.5606-.216-.96-.4771-1.3819-.895-.422-.4178-.6811-.8186-.9-1.378-.1644-.4234-.3624-1.058-.4171-2.228-.0595-1.2645-.072-1.6442-.079-4.848-.007-3.2037.0053-3.583.0607-4.848.05-1.169.2456-1.805.408-2.2282.216-.5613.4762-.96.895-1.3816.4188-.4217.8184-.6814 1.3783-.9003.423-.1651 1.0575-.3614 2.227-.4171 1.2655-.06 1.6447-.072 4.848-.079 3.2033-.007 3.5835.005 4.8495.0608 1.169.0508 1.8053.2445 2.228.408.5608.216.96.4754 1.3816.895.4217.4194.6816.8176.9005 1.3787.1653.4217.3617 1.056.4169 2.2263.0602 1.2655.0739 1.645.0796 4.848.0058 3.203-.0055 3.5834-.061 4.848-.051 1.17-.245 1.8055-.408 2.2294-.216.5604-.4763.96-.8954 1.3814-.419.4215-.8181.6811-1.3783.9-.4224.1649-1.0577.3617-2.2262.4174-1.2656.0595-1.6448.072-4.8493.079-3.2045.007-3.5825-.006-4.848-.0608M16.953 5.5864A1.44 1.44 0 1 0 18.39 4.144a1.44 1.44 0 0 0-1.437 1.4424M5.8385 12.012c.0067 3.4032 2.7706 6.1557 6.173 6.1493 3.4026-.0065 6.157-2.7701 6.1506-6.1733-.0065-3.4032-2.771-6.1565-6.174-6.1498-3.403.0067-6.156 2.771-6.1496 6.1738M8 12.0077a4 4 0 1 1 4.008 3.9921A3.9996 3.9996 0 0 1 8 12.0077' },
  intercom: { hex: '#6AFDEF', path: 'M21 0H3C1.343 0 0 1.343 0 3v18c0 1.658 1.343 3 3 3h18c1.658 0 3-1.342 3-3V3c0-1.657-1.342-3-3-3zm-5.801 4.399c0-.44.36-.8.802-.8.44 0 .8.36.8.8v10.688c0 .442-.36.801-.8.801-.443 0-.802-.359-.802-.801V4.399zM11.2 3.994c0-.44.357-.799.8-.799s.8.359.8.799v11.602c0 .44-.357.8-.8.8s-.8-.36-.8-.8V3.994zm-4 .405c0-.44.359-.8.799-.8.443 0 .802.36.802.8v10.688c0 .442-.36.801-.802.801-.44 0-.799-.359-.799-.801V4.399zM3.199 6c0-.442.36-.8.802-.8.44 0 .799.358.799.8v7.195c0 .441-.359.8-.799.8-.443 0-.802-.36-.802-.8V6zM20.52 18.202c-.123.105-3.086 2.593-8.52 2.593-5.433 0-8.397-2.486-8.521-2.593-.335-.288-.375-.792-.086-1.128.285-.334.79-.375 1.125-.09.047.041 2.693 2.211 7.481 2.211 4.848 0 7.456-2.186 7.479-2.207.334-.289.839-.25 1.128.086.289.336.25.84-.086 1.128zm.281-5.007c0 .441-.36.8-.801.8-.441 0-.801-.36-.801-.8V6c0-.442.361-.8.801-.8.441 0 .801.357.801.8v7.195z' },
  zapier: { hex: '#FF4F00', path: 'M4.157 0A4.151 4.151 0 0 0 0 4.161v15.678A4.151 4.151 0 0 0 4.157 24h15.682A4.152 4.152 0 0 0 24 19.839V4.161A4.152 4.152 0 0 0 19.839 0H4.157Zm10.61 8.761h.03a.577.577 0 0 1 .23.038.585.585 0 0 1 .201.124.63.63 0 0 1 .162.431.612.612 0 0 1-.162.435.58.58 0 0 1-.201.128.58.58 0 0 1-.23.042.529.529 0 0 1-.235-.042.585.585 0 0 1-.332-.328.559.559 0 0 1-.038-.235.613.613 0 0 1 .17-.431.59.59 0 0 1 .405-.162Zm2.853 1.572c.03.004.061.004.095.004.325-.011.646.064.937.219.238.144.431.355.552.609.128.279.189.582.185.888v.193a2 2 0 0 1 0 .219h-2.498c.003.227.075.45.204.642a.78.78 0 0 0 .646.265.714.714 0 0 0 .484-.136.642.642 0 0 0 .23-.318l.915.257a1.398 1.398 0 0 1-.28.537c-.14.159-.321.284-.521.355a2.234 2.234 0 0 1-.836.136 1.923 1.923 0 0 1-1.001-.245 1.618 1.618 0 0 1-.665-.703 2.221 2.221 0 0 1-.227-1.036 1.95 1.95 0 0 1 .48-1.398 1.9 1.9 0 0 1 1.3-.488Zm-9.607.023c.162.004.325.026.48.079.207.065.4.174.563.314.26.302.393.692.366 1.088v2.276H8.53l-.109-.711h-.065c-.064.163-.155.31-.272.439a1.122 1.122 0 0 1-.374.264 1.023 1.023 0 0 1-.453.083 1.334 1.334 0 0 1-.866-.264.965.965 0 0 1-.329-.801.993.993 0 0 1 .076-.431 1.02 1.02 0 0 1 .242-.363 1.478 1.478 0 0 1 1.043-.303h.952v-.181a.696.696 0 0 0-.136-.454.553.553 0 0 0-.438-.154.695.695 0 0 0-.378.086.48.48 0 0 0-.193.254l-.99-.144a1.26 1.26 0 0 1 .257-.563c.14-.174.321-.302.533-.378.261-.091.54-.136.82-.129.053-.003.106-.007.163-.007Zm4.384.007c.174 0 .347.038.506.114.182.083.34.211.458.374.257.423.377.911.351 1.406a2.53 2.53 0 0 1-.355 1.448 1.148 1.148 0 0 1-1.009.517c-.204 0-.401-.045-.582-.136a1.052 1.052 0 0 1-.48-.457 1.298 1.298 0 0 1-.114-.234h-.045l.004 1.784h-1.059v-4.713h.904l.117.805h.057c.068-.208.177-.401.328-.56a1.129 1.129 0 0 1 .843-.344h.076v-.004Zm7.559.084h.903l.113.805h.053a1.37 1.37 0 0 1 .235-.484.813.813 0 0 1 .313-.242.82.82 0 0 1 .39-.076h.234v1.051h-.401a.662.662 0 0 0-.313.008.623.623 0 0 0-.272.155.663.663 0 0 0-.174.26.683.683 0 0 0-.027.314v1.875h-1.054v-3.666Zm-17.515.003h3.262v.896L3.73 13.104l.034.113h1.973l.042.9H2.4v-.9l1.931-1.754-.045-.117H2.441v-.896Zm11.815 0h1.055v3.659h-1.055V10.45Zm3.443.684.019.016a.69.69 0 0 0-.351.045.756.756 0 0 0-.287.204c-.11.155-.174.336-.189.522h1.545c-.034-.526-.257-.787-.74-.787h.003Zm-5.718.163c-.026 0-.057 0-.083.004a.78.78 0 0 0-.31.053.746.746 0 0 0-.257.189 1.016 1.016 0 0 0-.204.695v.064c-.015.257.057.507.204.711a.634.634 0 0 0 .253.196.638.638 0 0 0 .314.061.644.644 0 0 0 .578-.265c.14-.223.204-.48.189-.74a1.216 1.216 0 0 0-.181-.711.677.677 0 0 0-.503-.257Zm-4.509 1.266a.464.464 0 0 0-.268.102.373.373 0 0 0-.114.276c0 .053.008.106.027.155a.375.375 0 0 0 .087.132.576.576 0 0 0 .397.11v.004a.863.863 0 0 0 .563-.182.573.573 0 0 0 .211-.457v-.14h-.903Z' },
  telegram: { hex: '#26A5E4', path: 'M11.944 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0a12 12 0 0 0-.056 0zm4.962 7.224c.1-.002.321.023.465.14a.506.506 0 0 1 .171.325c.016.093.036.306.02.472-.18 1.898-.962 6.502-1.36 8.627-.168.9-.499 1.201-.82 1.23-.696.065-1.225-.46-1.9-.902-1.056-.693-1.653-1.124-2.678-1.8-1.185-.78-.417-1.21.258-1.91.177-.184 3.247-2.977 3.307-3.23.007-.032.014-.15-.056-.212s-.174-.041-.249-.024c-.106.024-1.793 1.14-5.061 3.345-.48.33-.913.49-1.302.48-.428-.008-1.252-.241-1.865-.44-.752-.245-1.349-.374-1.297-.789.027-.216.325-.437.893-.663 3.498-1.524 5.83-2.529 6.998-3.014 3.332-1.386 4.025-1.627 4.476-1.635z' },
  make: { hex: '#6D00CC', path: 'M13.38 3.498c-.27 0-.511.19-.566.465L9.85 18.986a.578.578 0 0 0 .453.678l4.095.826a.58.58 0 0 0 .682-.455l2.963-15.021a.578.578 0 0 0-.453-.678l-4.096-.826a.589.589 0 0 0-.113-.012zm-5.876.098a.576.576 0 0 0-.516.318L.062 17.697a.575.575 0 0 0 .256.774l3.733 1.877a.578.578 0 0 0 .775-.258l6.926-13.781a.577.577 0 0 0-.256-.776L7.762 3.658a.571.571 0 0 0-.258-.062zm11.74.115a.576.576 0 0 0-.576.576v15.426c0 .318.258.578.576.578h4.178a.58.58 0 0 0 .578-.578V4.287a.578.578 0 0 0-.578-.576Z' },
  zoho: { hex: '#E42527', path: 'M8.66 6.897a1.299 1.299 0 0 0-1.205.765l-.642 1.44-.062-.385A1.291 1.291 0 0 0 5.27 7.648l-4.185.678A1.291 1.291 0 0 0 .016 9.807l.678 4.18a1.293 1.293 0 0 0 1.27 1.087c.074 0 .143-.01.216-.017l4.18-.678c.436-.07.784-.351.96-.723l2.933 1.307a1.304 1.304 0 0 0 .988.026c.321-.12.575-.365.716-.678l.28-.629.038.276a1.297 1.297 0 0 0 1.455 1.103l3.712-.501a1.29 1.29 0 0 0 1.03.514h4.236c.713 0 1.29-.58 1.291-1.291V9.545c0-.712-.58-1.291-1.291-1.291h-4.236c-.079 0-.155.008-.23.022a1.309 1.309 0 0 0-.275-.288c-.275-.21-.614-.3-.958-.253l-4.197.571c-.155.021-.3.07-.432.14L9.159 7.01a1.27 1.27 0 0 0-.499-.113zm-.025.705c.077 0 .159.013.24.052l2.971 1.324c-.128.238-.18.508-.142.782l.357 2.596h.002l-.745 1.672a.59.59 0 0 1-.777.296l-3.107-1.385-.004-.041-.41-2.526L8.1 7.95a.589.589 0 0 1 .536-.348zm-3.159.733c.125 0 .245.039.343.112.13.09.21.227.237.382l.234 1.446-.56 1.259a1.27 1.27 0 0 0-.026.987c.12.322.364.575.678.717l.295.131a.585.585 0 0 1-.428.314l-4.185.678a.59.59 0 0 1-.674-.485l-.678-4.18a.588.588 0 0 1 .485-.674l4.185-.678c.03-.004.064-.01.094-.01zm11.705.09a.59.59 0 0 1 .415.173 1.287 1.287 0 0 0-.416.947v4.237c0 .033.003.065.005.097l-3.55.482a.586.586 0 0 1-.66-.502l-.191-1.403.899-2.017a1.29 1.29 0 0 0-.333-1.5l3.754-.51c.026-.004.051-.004.077-.004zm1.3.532h4.227c.326 0 .588.266.588.588v4.237a.589.589 0 0 1-.588.588h-4.237a.564.564 0 0 1-.12-.013c.47-.246.758-.765.684-1.318zm-5.988.309.254.113c.296.133.43.48.296.777l-.432.97-.207-1.465a.58.58 0 0 1 .09-.395zm5.39.538.453 3.325a.583.583 0 0 1-.453.65zM6.496 11.545l.17 1.052a.588.588 0 0 1-.293-.776zm3.985 4.344a.588.588 0 0 0-.612.603c0 .358.244.61.601.61a.582.582 0 0 0 .607-.608c0-.35-.242-.605-.596-.605zm5.545 0a.588.588 0 0 0-.612.603c0 .358.245.61.602.61a.582.582 0 0 0 .606-.608c0-.35-.24-.605-.596-.605zm-8.537.018a.047.047 0 0 0-.048.047v.085c0 .026.021.047.048.047h.52l-.623.9a.052.052 0 0 0-.009.027v.027c0 .026.021.047.048.047h.815a.047.047 0 0 0 .047-.047v-.085a.047.047 0 0 0-.047-.047h-.55l.606-.9a.05.05 0 0 0 .008-.026v-.028a.047.047 0 0 0-.047-.047zm5.303 0a.047.047 0 0 0-.047.047v1.086c0 .026.02.047.047.047h.135a.047.047 0 0 0 .047-.047v-.454h.545v.454c0 .026.02.047.047.047h.134a.047.047 0 0 0 .047-.047v-1.086a.047.047 0 0 0-.047-.047h-.134a.047.047 0 0 0-.047.047v.453h-.545v-.453a.047.047 0 0 0-.047-.047zm-2.324.164c.25 0 .372.194.372.425 0 .219-.109.425-.358.426-.242 0-.375-.197-.375-.419 0-.235.108-.432.36-.432zm5.545 0c.25 0 .372.194.372.425 0 .219-.108.425-.358.426-.242 0-.374-.197-.374-.419 0-.235.108-.432.36-.432z' },
  helpscout: { hex: '#1292EE', path: 'm3.497 14.044 7.022-7.021a4.946 4.946 0 0 0 1.474-3.526A4.99 4.99 0 0 0 10.563 0L3.54 7.024a4.945 4.945 0 0 0-1.473 3.525c0 1.373.55 2.6 1.43 3.496zm17.007-4.103-7.023 7.022a4.946 4.946 0 0 0-1.473 3.525c0 1.36.55 2.601 1.43 3.497l7.022-7.022a4.943 4.943 0 0 0 1.474-3.526c0-1.373-.55-2.6-1.43-3.496zm-.044-2.904a4.944 4.944 0 0 0 1.474-3.525c0-1.36-.55-2.6-1.43-3.497L3.54 16.965A4.986 4.986 0 0 0 3.497 24Z' },
}

function BrandMark({ name, size = 22 }) {
  const icon = BRAND_ICONS[name]
  if (!icon) return null
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill={icon.hex}>
      <path d={icon.path} />
    </svg>
  )
}

const HALO_LOGOS = [
  { icon: 'zendesk', top: '8%', left: '14%', size: 50 },
  { icon: 'hubspot', top: '27%', left: '7%', size: 46 },
  { icon: 'intercom', top: '46%', left: '10%', size: 44 },
  { icon: 'whatsapp', top: '61%', left: '17%', size: 48 },
  { icon: 'telegram', top: '8%', left: '86%', size: 46 },
  { icon: 'instagram', top: '27%', left: '93%', size: 52 },
  { icon: 'make', top: '46%', left: '90%', size: 44 },
  { icon: 'zapier', top: '61%', left: '83%', size: 48 },
]

const INTEGRATION_GROUPS = [
  { category: 'Help Desk / Soporte', tools: [{ n: 'Zendesk', icon: 'zendesk' }, { n: 'Freshdesk', c: '#28a745' }, { n: 'Intercom', icon: 'intercom' }, { n: 'Help Scout', icon: 'helpscout' }] },
  { category: 'CRM / Ventas', tools: [{ n: 'HubSpot', icon: 'hubspot' }, { n: 'Salesforce', c: '#00a1e0' }, { n: 'Pipedrive', c: '#0b6e4f' }, { n: 'Zoho CRM', icon: 'zoho' }] },
  { category: 'Mensajería', tools: [{ n: 'WhatsApp Business', icon: 'whatsapp' }, { n: 'Instagram', icon: 'instagram' }, { n: 'Slack', c: '#4a154b' }, { n: 'Telegram', icon: 'telegram' }] },
  { category: 'Automatización', tools: [{ n: 'Zapier', icon: 'zapier' }, { n: 'Make', icon: 'make' }, { n: 'Webhooks personalizados', c: '#334155' }] },
]

const STEPS = [
  { n: '1', title: 'Conectá tus canales', desc: 'Sumá WhatsApp, Instagram, chat web o email a la bandeja unificada de Open Central en minutos.' },
  { n: '2', title: 'Elegí tu CRM', desc: 'Seleccioná Zendesk, Freshdesk, HubSpot o cualquiera de nuestras integraciones nativas y autorizá el acceso.' },
  { n: '3', title: 'Dejá que la data fluya', desc: 'Cada chat, ticket y lead se sincroniza automáticamente, con el historial completo y sin duplicados.' },
]

const BANDEJA_BULLETS = [
  'Historial completo del cliente en cada conversación',
  'Asignación automática de conversaciones por equipo o agente',
  'Etiquetas y estados sincronizados con tu help desk',
  'Búsqueda unificada entre canales y tickets',
]

const SYNC_BULLETS = [
  'Sincronización bidireccional',
  'Mapeo de campos personalizado',
  'Webhooks para flujos avanzados',
  'Logs de auditoría por integración',
]

const USE_CASES = [
  { icon: '🎧', title: 'Soporte al cliente', desc: 'Reducí el tiempo de resolución conectando cada chat directo a Zendesk o Freshdesk, con contexto completo del cliente.' },
  { icon: '📈', title: 'Ventas y CRM', desc: 'Convertí conversaciones en oportunidades. Cada lead que entra por chat llega directo a HubSpot o Salesforce, listo para trabajar.' },
  { icon: '⚙️', title: 'Operaciones', desc: 'Automatizá flujos entre canales y sistemas con Zapier, Make o webhooks, sin depender de desarrollo.' },
]

const TESTIMONIALS = [
  { quote: 'Conectamos Open Central con Zendesk en menos de una tarde. Nuestro tiempo de primera respuesta bajó un 40%.', name: 'Nombre Apellido', role: 'Head of Support' },
  { quote: 'Cada chat de WhatsApp ahora crea un lead automático en HubSpot. Dejamos de perder oportunidades.', name: 'Nombre Apellido', role: 'Sales Ops Manager' },
]

const LOGO_BAR = ['Google', 'Airbnb', 'Notion', 'Shopify', 'Zoom', 'Stripe', 'Upwork']

const NOTIFICATIONS = [
  { icon: 'zendesk', title: 'Nuevo ticket sincronizado con Zendesk', meta: 'Hace 3 min · Conversación de WhatsApp' },
  { icon: 'hubspot', title: 'Lead creado en HubSpot', meta: 'María G. · Chat en vivo' },
  { color: '#28a745', letter: 'F', title: 'Caso actualizado en Freshdesk', meta: 'Agente: Diego R. · Prioridad alta' },
]

function ToolChip({ tool }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '8px 12px', borderRadius: 10, background: '#f8fafc', border: '1px solid #e2e8f0' }}>
      {tool.icon ? (
        <span style={{ width: 20, height: 20, flexShrink: 0, display: 'inline-flex', alignItems: 'center', justifyContent: 'center' }}>
          <BrandMark name={tool.icon} size={16} />
        </span>
      ) : (
        <span style={{ width: 20, height: 20, borderRadius: 6, background: tool.c, flexShrink: 0, display: 'inline-flex', alignItems: 'center', justifyContent: 'center', fontSize: 9.5, fontWeight: 800, color: '#fff' }}>
          {tool.n.split(' ').map(w => w[0]).join('').slice(0, 2)}
        </span>
      )}
      <span style={{ fontSize: 13, fontWeight: 600, color: '#334155' }}>{tool.n}</span>
    </div>
  )
}

function CheckBullet({ children }) {
  return (
    <li style={{ display: 'flex', alignItems: 'flex-start', gap: 10, fontSize: 14.5, color: '#334155', lineHeight: 1.5 }}>
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" style={{ flexShrink: 0, marginTop: 1 }}>
        <circle cx="12" cy="12" r="10" fill="#0f172a" />
        <path d="M8 12l3 3 5-5" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
      {children}
    </li>
  )
}

export function OpenCentralPage({ onBack }) {
  const [isMobile, setIsMobile] = useState(() => window.innerWidth < 860)

  useEffect(() => {
    const handler = () => setIsMobile(window.innerWidth < 860)
    window.addEventListener('resize', handler)
    return () => window.removeEventListener('resize', handler)
  }, [])

  return (
    <div style={{ minHeight: '100vh', background: '#fff', fontFamily: FONT, color: '#0f172a' }}>
      <style>{`
        @keyframes ocp-up { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }
        @keyframes ocp-fade { from { opacity: 0; } to { opacity: 1; } }
        @keyframes ocp-float { 0%, 100% { transform: translateY(0); } 50% { transform: translateY(-10px); } }
        @keyframes ocp-pulse { 0%, 100% { transform: scale(1); opacity: 1; } 50% { transform: scale(1.4); opacity: 0.4; } }
        @media (prefers-reduced-motion: reduce) { * { animation-duration: 0.01ms !important; animation-delay: 0ms !important; } }
        .ocp-btn-primary {
          display: inline-flex; align-items: center; justify-content: center; gap: 8px;
          background: #0f172a; color: #fff; border: none; border-radius: 10px;
          padding: 13px 24px; font-size: 14.5px; font-weight: 700; cursor: pointer;
          font-family: inherit; transition: background 150ms, transform 150ms;
        }
        .ocp-btn-primary:hover { background: #1e293b; transform: translateY(-1px); }
        .ocp-btn-outline {
          display: inline-flex; align-items: center; justify-content: center; gap: 8px;
          background: #fff; color: #0f172a; border: 1.5px solid #e2e8f0; border-radius: 10px;
          padding: 13px 24px; font-size: 14.5px; font-weight: 700; cursor: pointer;
          font-family: inherit; transition: border-color 150ms, background 150ms;
        }
        .ocp-btn-outline:hover { border-color: #94a3b8; background: #f8fafc; }
        .ocp-btn-outline-dark {
          display: inline-flex; align-items: center; justify-content: center; gap: 8px;
          background: transparent; color: #fff; border: 1.5px solid rgba(255,255,255,0.3); border-radius: 10px;
          padding: 13px 24px; font-size: 14.5px; font-weight: 700; cursor: pointer;
          font-family: inherit; transition: border-color 150ms, background 150ms;
        }
        .ocp-btn-outline-dark:hover { border-color: #fff; background: rgba(255,255,255,0.08); }
        .ocp-nav-link { color: #475569; text-decoration: none; font-size: 14px; font-weight: 500; display: flex; align-items: center; gap: 4px; }
        .ocp-nav-link:hover { color: #0f172a; }
        .ocp-halo-item { animation: ocp-float 5s ease-in-out infinite; }
        @media (max-width: 860px) {
          .ocp-nav-links { display: none !important; }
          .ocp-halo { display: none !important; }
          .ocp-2col { grid-template-columns: 1fr !important; }
          .ocp-2col-rev { flex-direction: column !important; }
        }
      `}</style>

      {/* ── NAVBAR ── */}
      <header style={{
        position: 'sticky', top: 0, zIndex: 100,
        background: 'rgba(255,255,255,0.85)', backdropFilter: 'blur(14px)', WebkitBackdropFilter: 'blur(14px)',
        borderBottom: '1px solid #f1f5f9',
      }}>
        <div style={{ maxWidth: 1200, margin: '0 auto', height: 68, display: 'flex', alignItems: 'center', gap: 32, padding: '0 24px' }}>
          <button
            onClick={onBack}
            style={{ display: 'flex', alignItems: 'center', gap: 8, background: 'none', border: 'none', cursor: 'pointer', padding: 0, fontFamily: 'inherit' }}
            aria-label="Volver"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" style={{ color: '#94a3b8' }}>
              <path d="M19 12H5M12 5l-7 7 7 7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            <span style={{ fontSize: 17, fontWeight: 800, letterSpacing: '-0.02em', color: '#0f172a' }}>Open Central</span>
          </button>

          <nav className="ocp-nav-links" style={{ display: 'flex', alignItems: 'center', gap: 28, flex: 1 }}>
            <a className="ocp-nav-link" href="#integraciones">Producto</a>
            <a className="ocp-nav-link" href="#integraciones">Integraciones</a>
            <a className="ocp-nav-link" href="#soluciones">
              Soluciones
              <svg width="11" height="11" viewBox="0 0 24 24" fill="none"><path d="M6 9l6 6 6-6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" /></svg>
            </a>
            <a className="ocp-nav-link" href="#pricing">Precios</a>
            <a className="ocp-nav-link" href="#testimonios">Recursos</a>
          </nav>

          <div style={{ flex: isMobile ? 1 : undefined }} />

          <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexShrink: 0 }}>
            {!isMobile && <button className="ocp-btn-outline" style={{ padding: '9px 16px', fontSize: 13.5 }}>Iniciar sesión</button>}
            <button className="ocp-btn-primary" style={{ padding: '9px 18px', fontSize: 13.5 }}>Empezar gratis</button>
          </div>
        </div>
      </header>

      {/* ── HERO ── */}
      <section style={{ position: 'relative', padding: isMobile ? '56px 20px 64px' : '88px 24px 96px', overflow: 'hidden', background: '#fff' }}>
        {/* Halo rings + logos */}
        <div className="ocp-halo" style={{ position: 'absolute', inset: 0, pointerEvents: 'none' }}>
          {[380, 540, 700].map((d, i) => (
            <div key={d} style={{
              position: 'absolute', top: '50%', left: '50%', width: d, height: d,
              transform: 'translate(-50%, -50%)', borderRadius: '50%',
              border: `1px solid rgba(15,23,42,${0.09 - i * 0.02})`,
            }} />
          ))}
          {HALO_LOGOS.map((h, i) => (
            <div key={i} className="ocp-halo-item" style={{
              position: 'absolute', top: h.top, left: h.left,
              width: h.size, height: h.size, borderRadius: '50%',
              background: '#fff', boxShadow: '0 8px 24px rgba(15,23,42,0.12), 0 0 0 1px rgba(15,23,42,0.04)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              animationDelay: `${i * 0.4}s`,
            }}>
              <BrandMark name={h.icon} size={h.size * 0.46} />
            </div>
          ))}
        </div>

        <div style={{ position: 'relative', maxWidth: 720, margin: '0 auto', textAlign: 'center' }}>
          {/* Rating bar */}
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: 14, background: '#fff', border: '1px solid #e2e8f0', borderRadius: 999, padding: '8px 18px', marginBottom: 28, boxShadow: '0 2px 10px rgba(15,23,42,0.05)', animation: `ocp-up 0.5s ${EASING} both` }}>
            <span style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 13.5, fontWeight: 700, color: '#0f172a' }}>
              <svg width="15" height="15" viewBox="0 0 24 24"><path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 01-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" /><path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.99.66-2.25 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.85A11 11 0 0012 23z" /><path fill="#FBBC05" d="M5.84 14.1a6.6 6.6 0 010-4.2V7.05H2.18a11 11 0 000 9.9z" /><path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1a11 11 0 00-9.82 6.05l3.66 2.85C6.71 7.3 9.14 5.38 12 5.38z" /></svg>
              4.7 Google
            </span>
            <span style={{ width: 1, height: 14, background: '#e2e8f0' }} />
            <span style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 13.5, fontWeight: 700, color: '#0f172a' }}>
              <span style={{ color: '#00b67a' }}>★</span> 4.8 Trustpilot
            </span>
          </div>

          <h1 style={{ fontSize: 'clamp(30px, 4.4vw, 50px)', fontWeight: 800, letterSpacing: '-0.03em', lineHeight: 1.12, margin: '0 0 20px', animation: `ocp-up 0.55s ${EASING} 0.08s both` }}>
            Todos tus canales de chat, conectados a tu CRM
          </h1>

          <p style={{ fontSize: 16.5, color: '#64748b', lineHeight: 1.65, maxWidth: 600, margin: '0 auto 32px', animation: `ocp-up 0.55s ${EASING} 0.16s both` }}>
            Centralizá las conversaciones de tus clientes y sincronizalas en tiempo real con Zendesk, Freshdesk, HubSpot y más de 30 herramientas, sin escribir una línea de código.
          </p>

          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 12, flexWrap: 'wrap', marginBottom: 48, animation: `ocp-up 0.55s ${EASING} 0.24s both` }}>
            <button className="ocp-btn-primary">Conectar mi primer CRM</button>
            <a href="#integraciones" className="ocp-btn-outline" style={{ textDecoration: 'none' }}>Ver integraciones</a>
          </div>

          {/* Floating activity card */}
          <div style={{
            background: '#fff', borderRadius: 18, border: '1px solid #e2e8f0',
            boxShadow: '0 24px 60px rgba(15,23,42,0.12)', maxWidth: 380, margin: '0 auto 36px',
            textAlign: 'left', overflow: 'hidden', animation: `ocp-up 0.6s ${EASING} 0.32s both`,
          }}>
            {NOTIFICATIONS.map((n, i) => (
              <div key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: 12, padding: '14px 16px', borderTop: i === 0 ? 'none' : '1px solid #f1f5f9' }}>
                {n.icon ? (
                  <span style={{ width: 30, height: 30, borderRadius: '50%', border: '1px solid #e2e8f0', flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <BrandMark name={n.icon} size={16} />
                  </span>
                ) : (
                  <span style={{ width: 30, height: 30, borderRadius: '50%', background: n.color, flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontWeight: 800, fontSize: 12 }}>
                    {n.letter}
                  </span>
                )}
                <div>
                  <div style={{ fontSize: 13.5, fontWeight: 600, color: '#0f172a', lineHeight: 1.4 }}>{n.title}</div>
                  <div style={{ fontSize: 12, color: '#94a3b8', marginTop: 2 }}>{n.meta}</div>
                </div>
              </div>
            ))}
          </div>

          <div style={{ fontSize: 13.5, color: '#94a3b8', marginBottom: 28, animation: `ocp-fade 0.6s ${EASING} 0.4s both` }}>
            Más de 150.000 conversaciones sincronizadas por día
          </div>

          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 32, flexWrap: 'wrap', animation: `ocp-fade 0.6s ${EASING} 0.46s both` }}>
            {LOGO_BAR.map(name => (
              <span key={name} style={{ fontSize: 16, fontWeight: 700, color: '#cbd5e1', letterSpacing: '-0.01em' }}>{name}</span>
            ))}
          </div>
        </div>
      </section>

      {/* ── INTEGRACIONES ── */}
      <section id="integraciones" style={{ background: '#f8fafc', padding: isMobile ? '56px 20px' : '96px 24px', borderTop: '1px solid #e2e8f0', borderBottom: '1px solid #e2e8f0' }}>
        <div style={{ maxWidth: 1080, margin: '0 auto', textAlign: 'center' }}>
          <div style={{ fontSize: 12.5, fontWeight: 700, color: '#2563eb', letterSpacing: '0.06em', textTransform: 'uppercase', marginBottom: 12 }}>Integraciones</div>
          <h2 style={{ fontSize: 'clamp(24px, 3vw, 34px)', fontWeight: 800, letterSpacing: '-0.02em', margin: '0 0 16px' }}>
            Conectá Open Central con las herramientas que ya usás
          </h2>
          <p style={{ fontSize: 15.5, color: '#64748b', lineHeight: 1.65, maxWidth: 640, margin: '0 auto 48px' }}>
            No migres nada. Open Central se integra directo con tu stack actual de soporte y ventas, para que cada conversación termine en el lugar correcto.
          </p>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: 20, textAlign: 'left', marginBottom: 40 }}>
            {INTEGRATION_GROUPS.map(g => (
              <div key={g.category} style={{ background: '#fff', border: '1px solid #e2e8f0', borderRadius: 16, padding: 20 }}>
                <div style={{ fontSize: 13, fontWeight: 700, color: '#0f172a', marginBottom: 14 }}>{g.category}</div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                  {g.tools.map(t => <ToolChip key={t.n} tool={t} />)}
                </div>
              </div>
            ))}
          </div>

          <button className="ocp-btn-outline">Ver las 30+ integraciones</button>
        </div>
      </section>

      {/* ── CÓMO FUNCIONA ── */}
      <section style={{ padding: isMobile ? '56px 20px' : '96px 24px' }}>
        <div style={{ maxWidth: 1000, margin: '0 auto', textAlign: 'center' }}>
          <div style={{ fontSize: 12.5, fontWeight: 700, color: '#2563eb', letterSpacing: '0.06em', textTransform: 'uppercase', marginBottom: 12 }}>Cómo funciona</div>
          <h2 style={{ fontSize: 'clamp(24px, 3vw, 34px)', fontWeight: 800, letterSpacing: '-0.02em', margin: '0 0 56px' }}>
            De la conversación al CRM, en tres pasos
          </h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 32, textAlign: 'left' }}>
            {STEPS.map(step => (
              <div key={step.n}>
                <div style={{ width: 40, height: 40, borderRadius: 12, background: '#0f172a', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 16 }}>
                  <span style={{ color: '#fff', fontWeight: 800, fontSize: 16 }}>{step.n}</span>
                </div>
                <div style={{ fontSize: 17, fontWeight: 700, marginBottom: 8 }}>{step.title}</div>
                <div style={{ fontSize: 14.5, color: '#64748b', lineHeight: 1.6 }}>{step.desc}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── FEATURE: BANDEJA UNIFICADA ── */}
      <section style={{ background: '#f8fafc', padding: isMobile ? '56px 20px' : '96px 24px', borderTop: '1px solid #e2e8f0' }}>
        <div className="ocp-2col" style={{ maxWidth: 1080, margin: '0 auto', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 56, alignItems: 'center' }}>
          <div>
            <h2 style={{ fontSize: 'clamp(22px, 2.8vw, 30px)', fontWeight: 800, letterSpacing: '-0.02em', margin: '0 0 16px', lineHeight: 1.2 }}>
              Una sola bandeja para todos tus agentes
            </h2>
            <p style={{ fontSize: 15, color: '#64748b', lineHeight: 1.65, margin: '0 0 24px' }}>
              Tu equipo ya no necesita saltar entre pestañas. Open Central junta cada canal de chat en una sola interfaz, con el contexto del cliente traído directo desde tu CRM.
            </p>
            <ul style={{ margin: 0, padding: 0, listStyle: 'none', display: 'flex', flexDirection: 'column', gap: 12 }}>
              {BANDEJA_BULLETS.map(b => <CheckBullet key={b}>{b}</CheckBullet>)}
            </ul>
          </div>
          <div style={{ background: '#fff', borderRadius: 18, border: '1px solid #e2e8f0', boxShadow: '0 20px 50px rgba(15,23,42,0.08)', padding: 16, display: 'flex', flexDirection: 'column', gap: 10 }}>
            {[
              { icon: 'whatsapp', name: 'María López', msg: 'Necesito ayuda con mi pedido...', unread: true },
              { icon: 'instagram', name: 'Juan Pérez', msg: '¿Tienen envío a Córdoba?', unread: false },
              { icon: 'zendesk', name: 'Ticket #4021', msg: 'Actualizado por Diego R.', unread: false },
              { icon: 'telegram', name: 'Carla Núñez', msg: 'Perfecto, muchas gracias!', unread: false },
            ].map((row, i) => (
              <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '10px 12px', borderRadius: 12, background: row.unread ? '#f8fafc' : 'transparent' }}>
                <span style={{ width: 34, height: 34, borderRadius: '50%', border: '1px solid #e2e8f0', flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <BrandMark name={row.icon} size={18} />
                </span>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: 13.5, fontWeight: row.unread ? 700 : 600, color: '#0f172a' }}>{row.name}</div>
                  <div style={{ fontSize: 12.5, color: '#94a3b8', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{row.msg}</div>
                </div>
                {row.unread && <span style={{ width: 8, height: 8, borderRadius: '50%', background: '#2563eb', flexShrink: 0 }} />}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── FEATURE: SINCRONIZACIÓN EN TIEMPO REAL ── */}
      <section style={{ padding: isMobile ? '56px 20px' : '96px 24px' }}>
        <div className="ocp-2col" style={{ maxWidth: 1080, margin: '0 auto', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 56, alignItems: 'center' }}>
          <div style={{ background: '#0f172a', borderRadius: 18, padding: isMobile ? '28px 16px' : 40, order: isMobile ? 2 : 0, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: isMobile ? 12 : 24, flexWrap: 'wrap' }}>
            <div style={{ background: '#fff', borderRadius: 14, padding: isMobile ? '14px 12px' : '18px 20px', textAlign: 'center', minWidth: 0, flex: isMobile ? '1 1 110px' : undefined }}>
              <div style={{ fontSize: 13, fontWeight: 800, color: '#0f172a' }}>Open Central</div>
              <div style={{ fontSize: 11, color: '#94a3b8', marginTop: 4 }}>Conversación</div>
            </div>
            <div style={{ position: 'relative', width: isMobile ? 28 : 60, height: 2, background: 'rgba(255,255,255,0.25)', flexShrink: 0 }}>
              <span style={{ position: 'absolute', top: -3, left: '50%', width: 8, height: 8, borderRadius: '50%', background: '#4ade80', animation: 'ocp-pulse 1.6s ease-in-out infinite' }} />
            </div>
            <div style={{ background: '#fff', borderRadius: 14, padding: isMobile ? '14px 12px' : '18px 20px', textAlign: 'center', minWidth: 0, flex: isMobile ? '1 1 110px' : undefined }}>
              <div style={{ fontSize: 13, fontWeight: 800, color: '#0f172a' }}>Tu CRM</div>
              <div style={{ fontSize: 11, color: '#94a3b8', marginTop: 4 }}>Ticket / Lead</div>
            </div>
          </div>
          <div>
            <h2 style={{ fontSize: 'clamp(22px, 2.8vw, 30px)', fontWeight: 800, letterSpacing: '-0.02em', margin: '0 0 16px', lineHeight: 1.2 }}>
              Sin duplicados, sin planillas, sin copiar y pegar
            </h2>
            <p style={{ fontSize: 15, color: '#64748b', lineHeight: 1.65, margin: '0 0 24px' }}>
              Cada mensaje, ticket o lead se actualiza en tiempo real entre Open Central y tu CRM. Cuando un agente cierra un chat, el ticket se cierra solo. Cuando llega un lead nuevo, ya está en tu pipeline.
            </p>
            <ul style={{ margin: 0, padding: 0, listStyle: 'none', display: 'flex', flexDirection: 'column', gap: 12 }}>
              {SYNC_BULLETS.map(b => <CheckBullet key={b}>{b}</CheckBullet>)}
            </ul>
          </div>
        </div>
      </section>

      {/* ── SOLUCIONES ── */}
      <section id="soluciones" style={{ background: '#f8fafc', padding: isMobile ? '56px 20px' : '96px 24px', borderTop: '1px solid #e2e8f0', borderBottom: '1px solid #e2e8f0' }}>
        <div style={{ maxWidth: 1080, margin: '0 auto', textAlign: 'center' }}>
          <div style={{ fontSize: 12.5, fontWeight: 700, color: '#2563eb', letterSpacing: '0.06em', textTransform: 'uppercase', marginBottom: 12 }}>Soluciones</div>
          <h2 style={{ fontSize: 'clamp(24px, 3vw, 34px)', fontWeight: 800, letterSpacing: '-0.02em', margin: '0 0 56px' }}>
            Pensado para equipos de soporte y ventas
          </h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: 20, textAlign: 'left' }}>
            {USE_CASES.map(u => (
              <div key={u.title} style={{ background: '#fff', border: '1px solid #e2e8f0', borderRadius: 18, padding: 28 }}>
                <div style={{ fontSize: 28, marginBottom: 16 }}>{u.icon}</div>
                <div style={{ fontSize: 16.5, fontWeight: 700, marginBottom: 10 }}>{u.title}</div>
                <div style={{ fontSize: 14, color: '#64748b', lineHeight: 1.6 }}>{u.desc}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── TESTIMONIOS ── */}
      <section id="testimonios" style={{ padding: isMobile ? '56px 20px' : '96px 24px' }}>
        <div style={{ maxWidth: 1000, margin: '0 auto', textAlign: 'center' }}>
          <div style={{ fontSize: 12.5, fontWeight: 700, color: '#2563eb', letterSpacing: '0.06em', textTransform: 'uppercase', marginBottom: 12 }}>Testimonios</div>
          <h2 style={{ fontSize: 'clamp(24px, 3vw, 34px)', fontWeight: 800, letterSpacing: '-0.02em', margin: '0 0 56px' }}>
            Equipos que ya centralizaron sus conversaciones
          </h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: 24, textAlign: 'left' }}>
            {TESTIMONIALS.map(t => (
              <div key={t.name + t.role} style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: 18, padding: 28 }}>
                <div style={{ fontSize: 30, color: '#cbd5e1', lineHeight: 1, marginBottom: 12, fontFamily: 'Georgia, serif' }}>&ldquo;</div>
                <p style={{ fontSize: 15.5, color: '#334155', lineHeight: 1.65, margin: '0 0 20px' }}>{t.quote}</p>
                <div style={{ fontSize: 13.5, fontWeight: 700, color: '#0f172a' }}>{t.name}</div>
                <div style={{ fontSize: 12.5, color: '#94a3b8' }}>{t.role}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── PRICING TEASER ── */}
      <section id="pricing" style={{ background: '#f8fafc', padding: isMobile ? '56px 20px' : '80px 24px', borderTop: '1px solid #e2e8f0', borderBottom: '1px solid #e2e8f0' }}>
        <div style={{ maxWidth: 640, margin: '0 auto', textAlign: 'center' }}>
          <h2 style={{ fontSize: 'clamp(22px, 3vw, 30px)', fontWeight: 800, letterSpacing: '-0.02em', margin: '0 0 14px' }}>
            Un plan para cada etapa de tu equipo
          </h2>
          <p style={{ fontSize: 15, color: '#64748b', lineHeight: 1.6, margin: '0 0 28px' }}>
            Desde equipos que están empezando hasta operaciones con múltiples marcas y CRMs conectados.
          </p>
          <button className="ocp-btn-outline">Ver planes y precios</button>
        </div>
      </section>

      {/* ── CTA FINAL ── */}
      <section style={{ background: '#0f172a', padding: isMobile ? '64px 20px' : '96px 24px', textAlign: 'center' }}>
        <div style={{ maxWidth: 560, margin: '0 auto' }}>
          <h2 style={{ fontSize: 'clamp(24px, 3.2vw, 36px)', fontWeight: 800, letterSpacing: '-0.02em', color: '#fff', margin: '0 0 14px' }}>
            Empezá a centralizar tus conversaciones hoy
          </h2>
          <p style={{ fontSize: 15.5, color: 'rgba(255,255,255,0.65)', margin: '0 0 32px' }}>
            Conectá tu primer CRM en minutos. Sin tarjeta de crédito.
          </p>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 12, flexWrap: 'wrap' }}>
            <button className="ocp-btn-primary" style={{ background: '#fff', color: '#0f172a' }}
              onMouseEnter={e => e.currentTarget.style.background = '#e2e8f0'}
              onMouseLeave={e => e.currentTarget.style.background = '#fff'}
            >Empezar gratis</button>
            <button className="ocp-btn-outline-dark">Hablar con ventas</button>
          </div>
        </div>
      </section>

      {/* ── FOOTER ── */}
      <footer style={{ padding: '32px 24px', textAlign: 'center' }}>
        <div style={{ fontSize: 13, color: '#94a3b8' }}>© {new Date().getFullYear()} Open Central. Todos los derechos reservados.</div>
      </footer>
    </div>
  )
}
