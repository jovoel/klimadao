import { t, Trans } from "@lingui/macro";
import { NextPage } from "next";
import dynamic from "next/dynamic";
import Link from "next/link";
import { useRouter } from "next/router";

import { ButtonPrimary, Section, Text } from "@klimadao/lib/components";
import { urls } from "@klimadao/lib/constants";
import {
  concatAddress,
  getImageSizes,
  trimWithLocale,
} from "@klimadao/lib/utils";

import { FacebookButton } from "components/FacebookButton";
import { Footer } from "components/Footer";
import { LinkedInButton } from "components/LinkedInButton";
import { Navigation } from "components/Navigation";
import { PageHead } from "components/PageHead";
import { TweetButton } from "components/TweetButton";
import { retirementTokenInfoMap } from "lib/getTokenInfo";

import { cx } from "@emotion/css";
import { CopyAddressButton } from "@klimadao/lib/components";
import Image from "next/image";
import sunsetMountains from "public/sunset-mountains.jpg";
import { RetirementFooter } from "../Footer";
import { BuyKlima } from "./BuyKlima";
import { DownloadCertificateButtonProps } from "./DownloadCertificateButton";
import { ProjectDetails } from "./ProjectDetails";
import { RetirementDate } from "./RetirementDate";
import { RetirementHeader } from "./RetirementHeader";
import { RetirementMessage } from "./RetirementMessage";
import { RetirementValue } from "./RetirementValue";
import * as styles from "./styles";
import { TextGroup } from "./TextGroup";

import { SingleRetirementPageProps } from "pages/retirements/[beneficiary]/[retirement_index]";
import { ViewPledgeButton } from "./ViewPledgeButton";

const DownloadCertificateButton: React.ComponentType<DownloadCertificateButtonProps> =
  dynamic(
    () =>
      import("./DownloadCertificateButton").then(
        (mod) => mod.DownloadCertificateButton
      ),
    {
      ssr: false,
      loading: () => (
        <ButtonPrimary
          disabled
          label={t({
            id: "shared.loading",
            message: "Loading...",
          })}
        />
      ),
    }
  );

export const SingleRetirementPage: NextPage<SingleRetirementPageProps> = (
  props
) => {
  const {
    beneficiaryAddress,
    retirement,
    retirementIndexInfo,
    nameserviceDomain,
    pledge,
  } = props;

  const { locale, asPath } = useRouter();
  const tokenData = retirementTokenInfoMap[retirementIndexInfo.typeOfToken];

  const amountWithoutWhiteSpace = retirementIndexInfo.amount.replace(
    /\.?0+$/,
    ""
  ); // remove whitespace 0s from string, e.g. 1.0 => 1

  // collect from indexInfo and optional data from subgraph
  const retireData = {
    amount: trimWithLocale(amountWithoutWhiteSpace, 2, locale),
    tokenLabel: tokenData.label,
    tokenIcon: tokenData.icon,
    beneficiaryName: retirementIndexInfo.beneficiaryName,
    retirementMessage: retirementIndexInfo.retirementMessage,
    timestamp: retirement?.timestamp || null,
    transactionID: retirement?.transaction?.id || null,
  };

  const retiree =
    retireData.beneficiaryName ||
    nameserviceDomain ||
    concatAddress(beneficiaryAddress);

  return (
    <>
      <PageHead
        title={t({
          id: "retirement.head.title",
          message: `KlimaDAO | Carbon Retirement Receipt`,
        })}
        mediaTitle={t({
          id: "retirement.head.metaTitle",
          message: `${retiree} retired ${retireData.amount} Tonnes of carbon`,
        })}
        metaDescription={t({
          id: "retirement.head.metaDescription",
          message: "Transparent, on-chain offsets powered by KlimaDAO.",
        })}
        canonicalUrl={props.canonicalUrl}
      />
      <Navigation activePage="Home" />

      <Section variant="gray" className={styles.section}>
        <RetirementHeader
          overline={retireData.beneficiaryName}
          title={t({
            id: "retirement.single.header.quantity",
            message: `${retireData.amount}t`,
          })}
          subline={
            <Trans id="retirement.single.header.subline">
              CO2-Equivalent Emissions Offset (Metric Tonnes)
            </Trans>
          }
        />
        <div className={styles.retirementContent}>
          <RetirementMessage
            message={
              retireData.retirementMessage ||
              t({
                id: "retirement.single.retirementMessage.placeholder",
                message: "No retirement message provided",
              })
            }
          />
          <RetirementValue
            value={retireData.amount}
            label={retireData.tokenLabel}
            icon={retireData.tokenIcon}
          />
          <div className={styles.metaData}>
            <div className="column">
              <TextGroup
                title={
                  <Trans id="retirement.single.beneficiary.title">
                    Beneficiary
                  </Trans>
                }
                text={
                  retireData.beneficiaryName ||
                  t({
                    id: "retirement.single.beneficiary.placeholder",
                    message: "No beneficiary name provided",
                  })
                }
              />
              <TextGroup
                title={
                  <Trans id="retirement.single.beneficiaryAddress.title">
                    Beneficiary Address
                  </Trans>
                }
                text={
                  <Link
                    href={`/retirements/${
                      nameserviceDomain || beneficiaryAddress
                    }`}
                    className="address"
                  >
                    {nameserviceDomain || concatAddress(beneficiaryAddress)}
                  </Link>
                }
              />
            </div>
            <div className="column">
              <RetirementDate timestamp={retireData.timestamp} />
              <TextGroup
                title={
                  <Trans id="retirement.single.retirementCertificate.title">
                    Certificate
                  </Trans>
                }
                text={
                  retirement ? (
                    <DownloadCertificateButton
                      beneficiaryName={retireData.beneficiaryName}
                      beneficiaryAddress={beneficiaryAddress}
                      retirement={retirement}
                      retirementIndex={props.retirementIndex}
                      retirementMessage={retireData.retirementMessage}
                      retirementUrl={`${urls.home}/${asPath}`}
                      projectDetails={props.projectDetails ?? undefined}
                      tokenData={tokenData}
                    />
                  ) : null
                }
              />
            </div>
          </div>
          <Text className={styles.data_description} t="caption" align="start">
            <Trans id="retirement.single.disclaimer">
              This represents the permanent retirement of tokenized carbon
              assets on the Polygon blockchain. This retirement and the
              associated data are immutable public records.
            </Trans>
          </Text>
          <div className={styles.pledge_button}>
            <ViewPledgeButton pledge={pledge} />
            {pledge === null && (
              <Text className={styles.create_pledge} t="caption" align="center">
                <Trans id="retirement.single.is_this_your_retirement">
                  Is this your retirement?
                </Trans>
                <Link href={`/pledge/${beneficiaryAddress}`}>
                  <Trans id="retirement.single.create_a_pledge">
                    Create a pledge now.
                  </Trans>
                </Link>
              </Text>
            )}
          </div>
        </div>
      </Section>

      <Section
        variant="gray"
        className={cx(styles.section, styles.sectionButtons)}
      >
        <div className={styles.sectionButtonsWrap}>
          <CopyAddressButton label="Copy Link" variant="gray" />
          {retireData.transactionID && (
            <ButtonPrimary
              href={`https://polygonscan.com/tx/${retireData.transactionID}`}
              target="_blank"
              variant="gray"
              rel="noopener noreferrer"
              label={t({
                id: "retirement.single.view_on_polygon_scan",
                message: "View on Polygonscan",
              })}
              className={styles.buttonViewOnPolygon}
            />
          )}
        </div>
      </Section>

      <Section variant="gray" className={styles.section}>
        <div className={styles.share_content}>
          <Image
            alt="Sunset Mountains"
            src={sunsetMountains}
            layout="fill"
            objectFit="cover"
            sizes={getImageSizes({ large: "1072px" })}
            placeholder="blur"
            className="image"
          />
          <Text className="title" t="h3">
            <Trans id="retirement.share.title">Share your impact</Trans>
          </Text>
          <div className="buttons">
            <TweetButton
              title={`${retiree} retired ${retireData.amount} Tonnes of carbon`}
              tags={["klimadao", "Offset"]}
            />
            <FacebookButton />
            <LinkedInButton />
            <CopyAddressButton variant="lightGray" shape="circle" />
          </div>
        </div>
      </Section>

      {props.retirement?.offset && (
        <Section variant="gray" className={styles.section}>
          <ProjectDetails
            projectDetails={props.projectDetails ?? undefined}
            offset={props.retirement.offset}
          />
        </Section>
      )}
      <Section variant="gray" className={styles.section}>
        <RetirementFooter />
      </Section>

      <Section variant="gray" className={styles.section}>
        <BuyKlima />
      </Section>

      <Footer />
    </>
  );
};
