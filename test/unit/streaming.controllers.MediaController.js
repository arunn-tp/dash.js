import MediaController from '../../src/streaming/controllers/MediaController';
import ObjectUtils from '../../src/streaming/utils/ObjectUtils';
import EventBus from '../../src/core/EventBus';
import Constants from '../../src/streaming/constants/Constants';
import Events from '../../src/core/events/Events';

import DomStorageMock from './mocks/DomStorageMock';

const expect = require('chai').expect;
const context = {};
const eventBus = EventBus(context).getInstance();
const objectUtils = ObjectUtils(context).getInstance();

describe("MediaController", function () {
    let mediaController;
    let domStorageMock;

    beforeEach(function () {

        domStorageMock = new DomStorageMock();
        mediaController = MediaController(context).getInstance();
        mediaController.setConfig({
            domStorage: domStorageMock
        });

    });

    afterEach(function () {
        mediaController.reset();
        mediaController = null;
    });

    describe('Initial Settings', function () {
        it('should not set initial settings - type undefined', function () {
            let settings = mediaController.getInitialSettings(undefined);
            expect(settings).to.not.exist;

            mediaController.setInitialSettings(undefined);

            settings = mediaController.getInitialSettings(undefined);
            expect(settings).to.not.exist;
        });

        it('should not set initial settings - value undefined', function () {
            let settings = mediaController.getInitialSettings('test');
            expect(settings).to.not.exist;

            mediaController.setInitialSettings('test');

            settings = mediaController.getInitialSettings('test');
            expect(settings).to.not.exist;
        });

        it('should set and get initial settings', function () {
            let settings = mediaController.getInitialSettings('test');
            expect(settings).to.not.exist;

            mediaController.setInitialSettings('test', 'testvalue');

            settings = mediaController.getInitialSettings('test');
            expect(settings).to.equal('testvalue');
        });
    });

    describe('Switch Mode', function () {
        it('should not set switch mode if mode is not supported', function () {
            let switchmode = mediaController.getSwitchMode('test');
            expect(switchmode).to.not.exist;

            mediaController.setSwitchMode('test', 'unsupported');

            switchmode = mediaController.getSwitchMode('test');
            expect(switchmode).to.not.exist;
        });

        it('should set and get switch mode', function () {
            let switchmode = mediaController.getSwitchMode('test');
            expect(switchmode).to.not.exist;

            mediaController.setSwitchMode('test', MediaController.TRACK_SWITCH_MODE_ALWAYS_REPLACE);

            switchmode = mediaController.getSwitchMode('test');
            expect(switchmode).to.equal(MediaController.TRACK_SWITCH_MODE_ALWAYS_REPLACE);
        });
    });

    describe('Selection Mode For Initial Track', function () {
        it('should not set selection mode if mode is not supported', function () {
            let mode = mediaController.getSelectionModeForInitialTrack();
            expect(mode).to.equal(MediaController.DEFAULT_INIT_TRACK_SELECTION_MODE);

            mediaController.setSelectionModeForInitialTrack('unsupported');

            mediaController.getSelectionModeForInitialTrack();
            expect(mode).to.equal(MediaController.DEFAULT_INIT_TRACK_SELECTION_MODE);
        });

        it('should set and get selection mode', function () {
            let mode = mediaController.getSelectionModeForInitialTrack();
            expect(mode).to.equal(MediaController.DEFAULT_INIT_TRACK_SELECTION_MODE);

            mediaController.setSelectionModeForInitialTrack(MediaController.TRACK_SELECTION_MODE_HIGHEST_BITRATE);

            mediaController.getSelectionModeForInitialTrack();
            expect(mode).to.equal(MediaController.TRACK_SELECTION_MODE_HIGHEST_BITRATE);
        });
    });

    describe('Multi Track Supported', function () {
        it('should return false if type is not supported', function () {

            let supported = mediaController.isMultiTrackSupportedByType(null);
            expect(supported).to.be.false;

            supported = mediaController.isMultiTrackSupportedByType(undefined);
            expect(supported).to.be.false;

            supported = mediaController.isMultiTrackSupportedByType('toto');
            expect(supported).to.be.false;
        });

        it('should return true if type is supported', function () {

            let supported = mediaController.isMultiTrackSupportedByType(Constants.AUDIO);
            expect(supported).to.be.true;

            supported = mediaController.isMultiTrackSupportedByType(Constants.VIDEO);
            expect(supported).to.be.true;

            supported = mediaController.isMultiTrackSupportedByType(Constants.TEXT);
            expect(supported).to.be.true;

            supported = mediaController.isMultiTrackSupportedByType(Constants.FRAGMENTED_TEXT);
            expect(supported).to.be.true;
        });

    });

    describe('Track Equality', function () {
        it('should return false if track are not equals', function () {

            let track1 = {
                id: 'id',
                viewpoint: 'viewpoint',
                lang: 'lang',
                roles: 1,
                accessibility: 1,
                audioChannelConfiguration: 1
            };

            let track2 = {
                id: 'id2',
                viewpoint: 'viewpoint',
                lang: 'lang',
                roles: 1,
                accessibility: 1,
                audioChannelConfiguration: 1

            };
            let equal = mediaController.isTracksEqual(track1, track2);
            expect(equal).to.be.false;

        });

        it('should return true if track are equals', function () {

            let track1 = {
                id: 'id',
                viewpoint: 'viewpoint',
                lang: 'lang',
                roles: 1,
                accessibility: 1,
                audioChannelConfiguration: 1
            };

            let track2 = {
                id: 'id',
                viewpoint: 'viewpoint',
                lang: 'lang',
                roles: 1,
                accessibility: 1,
                audioChannelConfiguration: 1

            };
            let equal = mediaController.isTracksEqual(track1, track2);
            expect(equal).to.be.true;
        });

    });

    describe('Track Management', function () {
        it('should add and retrieve track', function () {

            let trackType = 'audio';
            let streamInfo = {
                id: 'id'
            };
            let track = {
                type: trackType,
                streamInfo: streamInfo
            };

            mediaController.addTrack(track);

            // check that track has been added

            let trackList = mediaController.getTracksFor(trackType, streamInfo);
            expect(trackList).to.have.lengthOf(1);
            expect(objectUtils.areEqual(trackList[0], track)).to.be.true;
        });

        it('should add and set current track', function () {

            let trackType = 'audio';
            let streamInfo = {
                id: 'id'
            };
            let track = {
                type: trackType,
                streamInfo: streamInfo
            };

            mediaController.addTrack(track);
            mediaController.setTrack(track);

            // check that track has been added
            let currentTrack = mediaController.getCurrentTrackFor(trackType, streamInfo);
            expect(objectUtils.areEqual(currentTrack, track)).to.be.true;
        });

        it('should check current track', function () {

            let trackType = 'audio';
            let streamInfo = {
                id: 'id'
            };
            let track = {
                type: trackType,
                streamInfo: streamInfo,
                lang: 'fr',
                viewpoint: 'viewpoint',
                roles: 1,
                accessibility: 1,
                audioChannelConfiguration: 1
            };

            mediaController.addTrack(track);
            mediaController.setTrack(track);

            // check that track has been added
            let currentTrack = mediaController.isCurrentTrack(track);
            expect(currentTrack).to.be.true;
        });

        it('should emit Events.CURRENT_TRACK_CHANGED when track has changed', function (done) {

            let trackType = 'audio';
            let streamInfo = {
                id: 'id'
            };

            let track1 = {
                type: trackType,
                streamInfo: streamInfo,
                lang: 'fr',
                viewpoint: 'viewpoint',
                roles: 1,
                accessibility: 1,
                audioChannelConfiguration: 1
            };

            let track2 = {
                type: trackType,
                streamInfo: streamInfo,
                lang: 'en',
                viewpoint: 'viewpoint',
                roles: 1,
                accessibility: 1,
                audioChannelConfiguration: 1
            };

            // add tracks
            mediaController.addTrack(track1);
            mediaController.addTrack(track2);

            // set track1 as current track
            mediaController.setTrack(track1);

            // check that track has been added
            let currentTrack = mediaController.getCurrentTrackFor(trackType, streamInfo);
            expect(objectUtils.areEqual(currentTrack, track1)).to.be.true;

            let onTrackChanged = function (e) {

                let old = e.oldMediaInfo;
                let current = e.newMediaInfo;
                let switchMode = e.switchMode;

                expect(objectUtils.areEqual(old, track1)).to.be.true;
                expect(objectUtils.areEqual(current, track2)).to.be.true;
                expect(switchMode).to.equal(MediaController.TRACK_SWITCH_MODE_ALWAYS_REPLACE);

                eventBus.off(Events.CURRENT_TRACK_CHANGED, onTrackChanged);
                done();
            };
            eventBus.on(Events.CURRENT_TRACK_CHANGED, onTrackChanged, this);

            // set track1 as current track
            mediaController.setTrack(track2);

        });
    });

    describe('Initial Track Management', function () {

        it('should check initial media settings to choose initial track', function () {

            let trackType = 'audio';
            let streamInfo = {
                id: 'id'
            };
            let track = {
                type: trackType,
                streamInfo: streamInfo,
                lang: 'fr',
                viewpoint: 'viewpoint',
                roles: 1,
                accessibility: 1,
                audioChannelConfiguration: 1
            };

            mediaController.addTrack(track);

            let trackList = mediaController.getTracksFor(trackType, streamInfo);
            expect(trackList).to.have.lengthOf(1);
            expect(objectUtils.areEqual(trackList[0], track)).to.be.true;

            let currentTrack = mediaController.getCurrentTrackFor(trackType, streamInfo);
            expect(objectUtils.areEqual(currentTrack, track)).to.be.false;

            // call to checkInitialMediaSettingsForType
            mediaController.setInitialSettings(trackType, {
                lang: 'fr',
                viewpoint: 'viewpoint'
            });
            mediaController.checkInitialMediaSettingsForType(trackType, streamInfo);

            currentTrack = mediaController.getCurrentTrackFor(trackType, streamInfo);
            expect(objectUtils.areEqual(currentTrack, track)).to.be.true;

        });

    });

});
