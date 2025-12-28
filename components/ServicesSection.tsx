"use client";

import CreateServiceDialog from "@/components/CreateServiceDialog";
import { useQuery } from "@tanstack/react-query";
import { fetchServices } from "@/services/services";
import type { ServiceProps } from "@/types/service";

export default function ServicesSection() {
  const services = useQuery({
    queryKey: ["services"],
    queryFn: fetchServices,
  });

  return (
    <div className="flex flex-col gap-4 rounded-xl bg-white p-4 shadow-md">
      <div className="flex justify-between">
        <h2 className="text-lg font-bold">Servicios</h2>
        <CreateServiceDialog />
      </div>
      <div className="grid grid-cols-4 gap-4">
        {services.data?.map((service: ServiceProps) => (
          <div
            key={service.id}
            className="col-span-1 mb-4 rounded-lg border p-4"
          >
            <h3 className="text-lg font-semibold">{service.serviceName}</h3>
            <p className="text-sm text-gray-600">
              Precio: {(service.price / 100).toFixed(2)} {service.currency}
            </p>
            {/* {service.description && (
              <p className="mt-2 text-gray-800">{service.description}</p>
            )} */}
          </div>
        ))}
      </div>
    </div>
  );
}
