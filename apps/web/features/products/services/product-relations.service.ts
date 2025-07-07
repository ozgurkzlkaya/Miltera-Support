import { type QueryConfig } from "../../../lib/react-query";

import { productQueries, useProduct } from "./product.service";
import { productTypeQueries, useProductType } from "./product-type.service";
import { productModelQueries, useProductModel } from "./product-model.service";
import { locationQueries, useLocation } from "../../shipments/location.service";
import { companyQueries, useCompany } from "../../companies/company.service";

const useProductWithRelations = ({
  id,
  productConfig,
  productTypeConfig,
  productModelConfig,
  productLocationConfig,
  productOwnerCompanyConfig,
}: {
  id: string | null;
  productConfig?: QueryConfig<typeof productQueries.detail>;
  productTypeConfig?: QueryConfig<typeof productTypeQueries.detail>;
  productModelConfig?: QueryConfig<typeof productModelQueries.detail>;
  productLocationConfig?: QueryConfig<typeof locationQueries.detail>;
  productOwnerCompanyConfig?: QueryConfig<typeof companyQueries.detail>;
}) => {
  const productQueryResult = useProduct({
    id: id ?? null,
    config: productConfig,
  });

  const productModelId = productQueryResult.data?.data?.productModelId;
  const productModelQueryResult = useProductModel({
    id: productModelId ?? null,
    config: productModelConfig,
  });

  const productTypeId = productModelQueryResult.data?.data?.productTypeId;
  const productTypeQueryResult = useProductType({
    id: productTypeId ?? null,
    config: productTypeConfig,
  });

  const productLocationId = productQueryResult.data?.data?.locationId;
  const productLocationQueryResult = useLocation({
    id: productLocationId ?? null,
  });

  const productOwnerCompanyId = productQueryResult.data?.data?.ownerId;
  const productOwnerCompanyQueryResult = useCompany({
    id: productOwnerCompanyId ?? null,
    config: productOwnerCompanyConfig,
  });

  return {
    productQueryResult,
    productTypeQueryResult,
    productModelQueryResult,
    productLocationQueryResult,
    productOwnerCompanyQueryResult,
    isLoading:
      productQueryResult.isLoading ||
      productTypeQueryResult.isLoading ||
      productModelQueryResult.isLoading ||
      productLocationQueryResult.isLoading ||
      productOwnerCompanyQueryResult.isLoading,
  };
};

export { useProductWithRelations };
