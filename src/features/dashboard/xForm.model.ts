export interface XForm {
  formID: string;
  name: string;
  majorMinorVersion: string;
  version: string;
  hash: string;
  descriptionText: string;
  downloadUrl: string;
  manifestUrl: string;
}

export interface XFormsResponse {
  xforms: {
    xform: XForm | XForm[];
  };
}