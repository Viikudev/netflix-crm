"use client";

import CreateServiceDialog from "@/components/CreateServiceDialog";
import { useQuery } from "@tanstack/react-query";
import { fetchServices } from "@/services/services";
import type { ServiceProps } from "@/types/service";
import ServiceActions from "@/components/ServiceActions";
import {
  Item,
  ItemActions,
  ItemContent,
  ItemDescription,
  ItemTitle,
} from "@/components/ui/item";

export default function ServicesSection() {
  const { data, isLoading, isError, error } = useQuery({
    queryKey: ["services"],
    queryFn: fetchServices,
  });

  return (
    <div className="col-span-2 flex max-h-94 flex-col gap-4 overflow-y-scroll rounded-xl bg-white p-4 shadow-md">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-bold">Servicios</h2>
        <CreateServiceDialog />
      </div>

      <div>
        {isLoading && <div>Loading services...</div>}
        {isError && (
          <div className="text-red-600">
            Error loading services: {error?.message ?? String(error)}
          </div>
        )}

        {!isLoading && !isError && (!data || data.length === 0) && (
          <div className="text-muted-foreground flex h-20 items-center justify-center text-sm">
            No se encontraron servicios
          </div>
        )}

        {!isLoading && !isError && data && data.length > 0 && (
          <div className="grid grid-cols-3 gap-4 max-2xl:grid-cols-2 max-lg:grid-cols-1">
            {data.map((service: ServiceProps) => {
              const textColor = service.textColor ?? "#111827";
              const backgroundColor = service.backgroundColor ?? "#f3f4f6";

              return (
                <Item
                  key={service.id}
                  variant="outline"
                  className="col-span-1 items-center shadow-md"
                  style={{ backgroundColor }}
                >
                  <ItemContent>
                    <ItemTitle
                      style={{
                        color: textColor,
                      }}
                      className="text-lg font-bold"
                    >
                      {service.serviceName}
                    </ItemTitle>
                    <ItemDescription
                      style={{ color: textColor }}
                      className="text-md font-medium"
                    >
                      Precio: {(service.price / 100).toFixed(2)}{" "}
                      {service.currency}
                    </ItemDescription>
                  </ItemContent>
                  <ItemActions>
                    <ServiceActions service={service} />
                  </ItemActions>
                </Item>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
