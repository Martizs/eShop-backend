import About from "../models/about";
import Contact from "../models/contact";
import Info from "../models/info";
import Policy from "../models/policy";
import { getCMS, saveCMS } from "../utils/modelHelpers";

export const CMSController = {
  saveAbout: (req, res) => saveCMS(req, res, About),
  saveContact: (req, res) => saveCMS(req, res, Contact),
  saveInfo: (req, res) => saveCMS(req, res, Info),
  savePolicy: (req, res) => saveCMS(req, res, Policy),
  getAbout: (req, res) => getCMS(req, res, About),
  getContact: (req, res) => getCMS(req, res, Contact),
  getInfo: (req, res) => getCMS(req, res, Info),
  getPolicy: (req, res) => getCMS(req, res, Policy),
};
