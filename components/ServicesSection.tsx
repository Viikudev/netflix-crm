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
  const services = useQuery({
    queryKey: ["services"],
    queryFn: fetchServices,
  });

  return (
    <div className="flex flex-col gap-4 rounded-xl bg-white p-4 shadow-md">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-bold">Servicios</h2>
        <CreateServiceDialog />
      </div>
      <div className="grid grid-cols-3 gap-4 max-sm:grid-cols-1">
        {services.data?.map((service: ServiceProps) => (
          <Item
            key={service.id}
            variant="outline"
            className="col-span-1 items-center"
          >
            <ItemContent>
              <ItemTitle>{service.serviceName}</ItemTitle>
              <ItemDescription>
                Precio: {(service.price / 100).toFixed(2)} {service.currency}
              </ItemDescription>
            </ItemContent>
            <ItemActions>
              <ServiceActions service={service} />
            </ItemActions>
          </Item>
        ))}
      </div>
    </div>
  );
}
