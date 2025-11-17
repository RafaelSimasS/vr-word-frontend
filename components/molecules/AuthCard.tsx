import React from "react";
import { Card, CardContent } from "@/components/atoms/card";

type AuthCardProps = {
  title?: string;
  subtitle?: string;
  children: React.ReactNode;
};

const AuthCard: React.FC<AuthCardProps> = ({
  title = "",
  subtitle = "",
  children,
}) => {
  return (
    <div className="min-h-screen flex items-center justify-center bg-black">
      <div className="w-full max-w-md px-4">
        <Card className="rounded-2xl overflow-hidden border border-gray-800 shadow-lg bg-[linear-gradient(180deg,#111111,#0b0b0b)] bg-opacity-80 backdrop-blur-sm">
          <CardContent className="p-6 bg-[linear-gradient(180deg,#111111,#0b0b0b)] bg-opacity-80 backdrop-blur-sm">
            <div className="text-center mb-4">
              <h2 className="text-xl sm:text-2xl font-semibold text-white">
                {title}
              </h2>
              <p className="text-xs text-gray-300">{subtitle}</p>
            </div>

            <div>{children}</div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default AuthCard;
