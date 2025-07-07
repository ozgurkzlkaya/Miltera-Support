import { getQueryClient } from "../../../lib/react-query";
import { productModelQueries } from "../services/product-model.service";
import { locationQueries } from "../../shipments/location.service";
import { companyQueries } from "../../companies/company.service";

const loadOptions = async (
  id: "productModel" | "shipment" | "company" | "location",
  query?: string
) => {
  const [listCb, field] =
    id === "productModel"
      ? [productModelQueries.list, "name"]
      : id === "company"
        ? [companyQueries.list, "name"]
        : id === "location"
          ? [locationQueries.list, "name"]
          : [];

  if (!listCb || !field) {
    return;
  }

  const list = listCb(
    query
      ? {
          filters: {
            [field]: {
              $containsi: query,
            },
          },
        }
      : undefined
  );

  const queryClient = getQueryClient();
  const data = await queryClient.fetchQuery(list as any);

  return data.data.map((item: any) => ({
    value: item.id,
    label: item[field],
  }));
};

export { loadOptions };
