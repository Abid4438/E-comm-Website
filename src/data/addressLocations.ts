import addressLocationsData from './addressLocationsData.json';
import pakistanHierarchyData from './pakistanAdministrativeHierarchy.json';

export const addressLocations = addressLocationsData as Record<string, Record<string, string[]>>;
export const addressCountries = Object.keys(addressLocations);

type PakistanTehsil = { name: { en: string } };
type PakistanDistrict = { id: string; name: { en: string }; tehsil: PakistanTehsil[] };
type PakistanProvince = { name: { en: string }; district: PakistanDistrict[] };

export const pakistanProvinces = (pakistanHierarchyData as { data: PakistanProvince[] }).data;

export const getPakistanDistricts = (provinceName: string) =>
  pakistanProvinces.find((province) => province.name.en === provinceName)?.district || [];

export const getPakistanCities = (provinceName: string, districtName: string) =>
  getPakistanDistricts(provinceName)
    .find((district) => district.name.en === districtName)?.tehsil
    .map((tehsil) => tehsil.name.en) || [];
