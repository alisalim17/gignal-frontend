import { Button, Link } from "@chakra-ui/react";
import { Form, Formik } from "formik";
import NextLink from "next/link";
import { useRouter } from "next/router";
import React, { useEffect } from "react";
import InputField from "../src/components/utils/InputField";
import {
  MeDocument,
  MeQuery,
  useMeQuery,
  useRegisterMutation,
} from "../src/generated/graphql";
import { toErrorMap } from "../src/utils/toErrorMap";
import { withApollo } from "../src/utils/withApollo";
import { form, formHeader } from "../styles/global";

interface Props {}

const Register: React.FC<Props> = () => {
  const { data } = useMeQuery();
  const router = useRouter();
  const [register] = useRegisterMutation();

  useEffect(() => {
    if (data?.me) router.push("/");
  }, [data]);

  return (
    <Formik
      initialValues={{ username: "", email: "", password: "" }}
      onSubmit={async (values, { setErrors }) => {
        const res = await register({
          variables: values,
          update: (cache, { data: _data }) => {
            cache.writeQuery<MeQuery>({
              query: MeDocument,
              data: {
                __typename: "Query",
                me: _data?.register.user,
              },
            });
          },
        });

        if (res.data?.register.errors) {
          setErrors(toErrorMap(res.data.register.errors));
        } else if (res.data?.register.user) {
          router.push("/");
        }
      }}
    >
      {({ isSubmitting }) => (
        <Form className={form}>
          <NextLink href="/">
            <h1 className={formHeader}>Register now!</h1>
          </NextLink>
          <InputField name="username" placeholder="Username" label="Username" />
          <InputField name="email" placeholder="Email" label="Email" />
          <InputField
            name="password"
            placeholder="Password"
            label="Password"
            type="password"
          />
          <NextLink href="/login">
            <Link ml="auto" mt="1" color="blue.400" className="text-sm">
              Already have an account ? Login here!
            </Link>
          </NextLink>
          <Button
            mx="auto"
            mt="6"
            isLoading={isSubmitting}
            type="submit"
            loadingText="Submitting"
            colorScheme="blue"
            width="200px"
            variant="solid"
          >
            Register
          </Button>
        </Form>
      )}
    </Formik>
  );
};

export default withApollo({ ssr: true })(Register);