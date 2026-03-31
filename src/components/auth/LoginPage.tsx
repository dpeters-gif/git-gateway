import { useState } from "react";
import { useTranslation } from "react-i18next";
import { useNavigate, Link } from "react-router-dom";
import { motion } from "framer-motion";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useAuth } from "@/hooks/useAuth";
import { slideUp, staggerContainer } from "@/lib/animations";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { InputOTP, InputOTPGroup, InputOTPSlot } from "@/components/ui/input-otp";
import { toast } from "sonner";

const adultSchema = z.object({
  email: z.string().email("Gültige E-Mail-Adresse eingeben"),
  password: z.string().min(6, "Mindestens 6 Zeichen"),
});

const childSchema = z.object({
  username: z.string().min(2, "Mindestens 2 Zeichen"),
  pin: z.string().length(4, "PIN muss 4 Ziffern haben"),
});

type AdultForm = z.infer<typeof adultSchema>;
type ChildForm = z.infer<typeof childSchema>;

export default function LoginPage() {
  const { t } = useTranslation();
  const { signIn, signInChild } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);

  const adultForm = useForm<AdultForm>({
    resolver: zodResolver(adultSchema),
    defaultValues: { email: "", password: "" },
  });

  const childForm = useForm<ChildForm>({
    resolver: zodResolver(childSchema),
    defaultValues: { username: "", pin: "" },
  });

  const onAdultSubmit = async (data: AdultForm) => {
    setLoading(true);
    const { error } = await signIn(data.email, data.password);
    setLoading(false);
    if (error) {
      toast.error(error);
    } else {
      navigate("/");
    }
  };

  const onChildSubmit = async (data: ChildForm) => {
    setLoading(true);
    const { error } = await signInChild(data.username, data.pin);
    setLoading(false);
    if (error) {
      toast.error(error);
    } else {
      navigate("/");
    }
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-6">
      <motion.div
        variants={staggerContainer}
        initial="hidden"
        animate="visible"
        className="w-full max-w-form-max space-y-8"
      >
        <motion.div variants={slideUp} className="text-center space-y-2">
          <h1 className="text-xl font-extrabold text-foreground">Familienzentrale</h1>
          <p className="text-base text-muted-foreground">{t("auth.login")}</p>
        </motion.div>

        <motion.div variants={slideUp}>
          <Tabs defaultValue="adult" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="adult">{t("auth.adultTab")}</TabsTrigger>
              <TabsTrigger value="child">{t("auth.childTab")}</TabsTrigger>
            </TabsList>

            <TabsContent value="adult" className="mt-6">
              <Form {...adultForm}>
                <form onSubmit={adultForm.handleSubmit(onAdultSubmit)} className="space-y-4">
                  <FormField
                    control={adultForm.control}
                    name="email"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>{t("auth.email")} *</FormLabel>
                        <FormControl>
                          <Input type="email" placeholder="eltern@example.com" className="h-12" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={adultForm.control}
                    name="password"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>{t("auth.password")} *</FormLabel>
                        <FormControl>
                          <Input type="password" className="h-12" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <Button type="submit" className="w-full h-12" disabled={loading}>
                    {loading ? t("common.loading") : t("auth.login")}
                  </Button>
                  <div className="text-center space-y-2">
                    <Link to="/signup" className="text-sm text-primary hover:underline">
                      {t("auth.signup")}
                    </Link>
                  </div>
                </form>
              </Form>
            </TabsContent>

            <TabsContent value="child" className="mt-6">
              <Form {...childForm}>
                <form onSubmit={childForm.handleSubmit(onChildSubmit)} className="space-y-4">
                  <FormField
                    control={childForm.control}
                    name="username"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>{t("auth.username")} *</FormLabel>
                        <FormControl>
                          <Input placeholder="Dein Benutzername" className="h-12" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={childForm.control}
                    name="pin"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>{t("auth.pin")} *</FormLabel>
                        <FormControl>
                          <div className="flex justify-center">
                            <InputOTP maxLength={4} value={field.value} onChange={field.onChange}>
                              <InputOTPGroup>
                                <InputOTPSlot index={0} />
                                <InputOTPSlot index={1} />
                                <InputOTPSlot index={2} />
                                <InputOTPSlot index={3} />
                              </InputOTPGroup>
                            </InputOTP>
                          </div>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <Button type="submit" className="w-full h-12 bg-child-accent hover:bg-child-accent-hover" disabled={loading}>
                    {loading ? t("common.loading") : t("auth.login")}
                  </Button>
                </form>
              </Form>
            </TabsContent>
          </Tabs>
        </motion.div>
      </motion.div>
    </div>
  );
}
