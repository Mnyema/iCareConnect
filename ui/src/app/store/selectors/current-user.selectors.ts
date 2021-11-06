import { CurrentUserState } from '../states';
import { createSelector } from '@ngrx/store';
import { getRootState, AppState } from '../reducers';
import { getChildLocationsOfTheFirstLevelParentLocation } from './locations.selectors';
import { sanitizeUserLocations } from 'src/app/shared/helpers/sanitize-user-locations.helper';

import { keyBy, flatten, indexOf } from 'lodash';

const getCurrentUserState = createSelector(
  getRootState,
  (state: AppState) => state.currentUser
);

export const getLoginErrorStatus = createSelector(
  getCurrentUserState,
  (state: CurrentUserState) => state.hasError
);

export const getLogInError = createSelector(
  getCurrentUserState,
  (state: CurrentUserState) => state.error
);

export const getAuthenticationLoadingState = createSelector(
  getCurrentUserState,
  (state: CurrentUserState) => state.loggingIn
);

export const getCurrentUserDetails = createSelector(
  getCurrentUserState,
  (state: CurrentUserState) => {
    return state.currentUser;
  }
);

export const getProviderDetails = createSelector(
  getCurrentUserState,
  (state: CurrentUserState) => state.provider
);

export const getUserAssignedLocations = createSelector(
  getCurrentUserState,
  getChildLocationsOfTheFirstLevelParentLocation,
  (state: CurrentUserState, availableLoginLocations) => {
    return sanitizeUserLocations(state.userLocations, availableLoginLocations);
  }
);

export const getCurrentUserPrivileges = createSelector(
  getCurrentUserState,
  (state: CurrentUserState) => {
    const matchedPrivileges = state.currentUser
      ? flatten(
          state.currentUser.roles.map((referenceUserRole) => {
            const availableRoleWithPrivileges = state.roles.find(
              (role) => role?.uuid === referenceUserRole?.uuid
            );
            return (
              availableRoleWithPrivileges?.privileges.map((privilege) => {
                return {
                  ...privilege,
                  role: referenceUserRole,
                };
              }) || []
            );
          })
        )
      : null;
    return matchedPrivileges
      ? {
          ...(keyBy(matchedPrivileges, 'uuid') || {}),
          ...(keyBy(matchedPrivileges, 'name') || {}),
        }
      : matchedPrivileges;
  }
);

export const getIfCurrentUserPrivilegesAreSet = createSelector(
  getCurrentUserState,
  (state: CurrentUserState) => {
    const matchedPrivileges = state.currentUser
      ? flatten(
          state.currentUser.roles.map((referenceUserRole) => {
            const availableRoleWithPrivileges = state.roles.find(
              (role) => role?.uuid === referenceUserRole?.uuid
            );
            return (
              availableRoleWithPrivileges?.privileges.map((privilege) => {
                return {
                  ...privilege,
                  role: referenceUserRole,
                };
              }) || []
            );
          })
        )
      : [];
    return matchedPrivileges?.length > 0;
  }
);

export const getAllUSerRoles = createSelector(
  getCurrentUserState,
  (state: CurrentUserState) => {
    return state.roles;
  }
);

export const getCurrentUserInfo = createSelector(
  getCurrentUserState,
  (state: CurrentUserState) => {
    return state.currentUser;
  }
);

export const getRolesLoadingState = createSelector(
  getCurrentUserState,
  (state: CurrentUserState) => state.loadingRoles
);

export const getRolesLoadedState = createSelector(
  getCurrentUserState,
  (state: CurrentUserState) => state.loadedRoles
);

export const getShouldReloadCurrentPageStatus = createSelector(
  getCurrentUserState,
  (state: CurrentUserState) => state.shouldReloadCurrentPage
);