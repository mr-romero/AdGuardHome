import React, { useEffect } from 'react';

import { HashLink as Link } from 'react-router-hash-link';
import { Trans, useTranslation } from 'react-i18next';
import classNames from 'classnames';

import Statistics from './Statistics';
import Counters from './Counters';
import Clients from './Clients';
import QueriedDomains from './QueriedDomains';
import BlockedDomains from './BlockedDomains';
import { SETTINGS_URLS, TIME_UNITS } from '../../helpers/constants';
import { msToSeconds, msToMinutes, msToHours, msToDays } from '../../helpers/helpers';

import PageTitle from '../ui/PageTitle';

import Loading from '../ui/Loading';
import './Dashboard.css';

import Dropdown from '../ui/Dropdown';
import UpstreamResponses from './UpstreamResponses';

import UpstreamAvgTime from './UpstreamAvgTime';
import { AccessData, DashboardData, StatsData } from '../../initialState';

interface DashboardProps {
    dashboard: DashboardData;
    stats: StatsData;
    access: AccessData;
    getStats: (...args: unknown[]) => unknown;
    getStatsConfig: (...args: unknown[]) => unknown;
    getClients: (...args: unknown[]) => unknown;
    getAccessList: () => (dispatch: any) => void;
}

const Dashboard = ({
    getAccessList,
    getStats,
    getStatsConfig,
    dashboard,
    stats,
    access,
}: DashboardProps) => {
    const { t } = useTranslation();

    const getAllStats = () => {
        getAccessList();
        getStats();
        getStatsConfig();
    };

    useEffect(() => {
        getAllStats();
    }, []);
    const getSubtitle = () => {
        if (!stats.enabled) {
            return t('stats_disabled_short');
        }

        const msIn7Days = 604800000;

        if (stats.timeUnits === TIME_UNITS.HOURS && stats.interval === msIn7Days) {
            return t('for_last_days', { count: msToDays(stats.interval) });
        }

        return stats.timeUnits === TIME_UNITS.HOURS
            ? t('for_last_hours', { count: msToHours(stats.interval) })
            : t('for_last_days', { count: msToDays(stats.interval) });
    };


    const refreshButton = (
        <button
            type="button"
            className="btn btn-icon btn-outline-primary btn-sm"
            title={t('refresh_btn')}
            onClick={() => getAllStats()}>
            <svg className="icons icon12">
                <use xlinkHref="#refresh" />
            </svg>
        </button>
    );

    const statsProcessing = stats.processingStats || stats.processingGetConfig || access.processing;

    const subtitle = getSubtitle();


    return (
        <>
            <PageTitle title={t('dashboard')} containerClass="page-title--dashboard">

                <button type="button" className="btn btn-outline-primary btn-sm" onClick={getAllStats}>
                    <Trans>refresh_statics</Trans>
                </button>
            </PageTitle>

            {statsProcessing && <Loading />}

            {!statsProcessing && (
                <div className="row row-cards dashboard">
                    <div className="col-lg-12">
                        {stats.interval === 0 && (
                            <div className="alert alert-warning" role="alert">
                                <Trans
                                    components={[
                                        <Link to={`${SETTINGS_URLS.settings}#stats-config`} key="0">
                                            link
                                        </Link>,
                                    ]}>
                                    stats_disabled
                                </Trans>
                            </div>
                        )}

                        <Statistics
                            interval={msToDays(stats.interval)}
                            dnsQueries={stats.dnsQueries}
                            blockedFiltering={stats.blockedFiltering}
                            replacedSafebrowsing={stats.replacedSafebrowsing}
                            replacedParental={stats.replacedParental}
                            numDnsQueries={stats.numDnsQueries}
                            numBlockedFiltering={stats.numBlockedFiltering}
                            numReplacedSafebrowsing={stats.numReplacedSafebrowsing}
                            numReplacedParental={stats.numReplacedParental}
                            refreshButton={refreshButton}
                        />
                    </div>

                    <div className="col-lg-6">
                        <Counters subtitle={subtitle} refreshButton={refreshButton} />
                    </div>

                    <div className="col-lg-6">
                        <Clients subtitle={subtitle} refreshButton={refreshButton} />
                    </div>

                    <div className="col-lg-6">
                        <QueriedDomains
                            subtitle={subtitle}
                            dnsQueries={stats.numDnsQueries}
                            topQueriedDomains={stats.topQueriedDomains}
                            refreshButton={refreshButton}
                        />
                    </div>

                    <div className="col-lg-6">
                        <BlockedDomains
                            subtitle={subtitle}
                            topBlockedDomains={stats.topBlockedDomains}
                            blockedFiltering={stats.numBlockedFiltering}
                            replacedSafebrowsing={stats.numReplacedSafebrowsing}
                            replacedSafesearch={stats.numReplacedSafesearch}
                            replacedParental={stats.numReplacedParental}
                            refreshButton={refreshButton}
                        />
                    </div>

                    <div className="col-lg-6">
                        <UpstreamResponses
                            subtitle={subtitle}
                            topUpstreamsResponses={stats.topUpstreamsResponses}
                            refreshButton={refreshButton}
                        />
                    </div>

                    <div className="col-lg-6">
                        <UpstreamAvgTime
                            subtitle={subtitle}
                            topUpstreamsAvgTime={stats.topUpstreamsAvgTime}
                            refreshButton={refreshButton}
                        />
                    </div>
                </div>
            )}
        </>
    );
};

export default Dashboard;
