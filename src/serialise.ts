import type { InterfaceInfo } from '../types/DtdlOm.d.ts'

export const serialiseInterface = (model: InterfaceInfo): any => {
  const dtdl = {
    '@id': model.Id,
    '@type': model.EntityKind,
    '@context': [`dtmi:dtdl:context;${model.languageMajorVersion}`],
    extends: {
      '@id': model.extends[0],
      '@type': model.EntityKind,
    },
  }
  return dtdl
}
