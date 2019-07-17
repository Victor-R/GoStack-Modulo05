import React, { Component } from 'react';
import { Link } from 'react-router-dom';
import { FaChevronRight, FaChevronLeft } from 'react-icons/fa';
import PropTypes from 'prop-types';

import api from '../../services/api';

import Container from '../../components/Container';

import { Loading, Owner, IssueList, FilterState, PageButtons } from './styles';

export default class Repository extends Component {
  static propTypes = {
    match: PropTypes.shape({
      params: PropTypes.shape({
        repository: PropTypes.string,
      }),
    }).isRequired,
  };

  state = {
    repository: {},
    issues: [],
    loading: true,
    stateFilter: 'open',
    page: 1,
  };

  async componentDidMount() {
    const { match } = this.props;
    const { stateFilter, page } = this.state;

    const repoName = decodeURIComponent(match.params.repository);

    const [repository, issues] = await Promise.all([
      api.get(`/repos/${repoName}`),
      api.get(`/repos/${repoName}/issues`, {
        params: {
          state: stateFilter,
          per_page: 5,
          page,
        },
      }),
    ]);

    this.setState({
      repository: repository.data,
      issues: issues.data,
      loading: false,
    });
  }

  async changeFilter(state) {
    const { match } = this.props;
    const { page } = this.state;

    const repoName = decodeURIComponent(match.params.repository);

    const response = await api.get(`/repos/${repoName}/issues`, {
      params: {
        state,
        per_page: 5,
        page,
      },
    });

    this.setState({
      stateFilter: state,
      issues: response.data,
    });
  }

  async changePage(direction) {
    const { match } = this.props;
    const { page, state } = this.state;
    const repoName = decodeURIComponent(match.params.repository);

    const response = await api.get(`/repos/${repoName}/issues`, {
      params: {
        state,
        per_page: 5,
        page: direction ? page + 1 : page - 1,
      },
    });

    console.log(response.data);

    this.setState({
      page: direction ? page + 1 : page - 1,
      issues: response.data,
    });
  }

  render() {
    const { repository, issues, loading, stateFilter, page } = this.state;

    if (loading) {
      return <Loading>Carregando</Loading>;
    }

    return (
      <Container>
        <Owner>
          <Link to="/">Voltar aos repositórios</Link>
          <img src={repository.owner.avatar_url} alt={repository.owner.login} />
          <h1>{repository.name}</h1>
          <p>{repository.description}</p>
        </Owner>

        <FilterState>
          <button
            type="button"
            disabled={stateFilter === 'open'}
            onClick={() => this.changeFilter('open')}
          >
            Open
          </button>
          <button
            type="button"
            name="closed"
            disabled={stateFilter === 'closed'}
            onClick={() => this.changeFilter('closed')}
          >
            Closed
          </button>
          <button
            type="button"
            name="all"
            disabled={stateFilter === 'all'}
            onClick={() => this.changeFilter('all')}
          >
            All
          </button>
        </FilterState>

        <IssueList>
          {issues.map(issue => (
            <li key={String(issue.id)}>
              <img src={issue.user.avatar_url} alt={issue.user.login} />
              <div>
                <strong>
                  <a href={issue.html_url}>{issue.title}</a>
                  {issue.labels.map(label => (
                    <span key={String(label.id)}>{label.name}</span>
                  ))}
                </strong>
                <p>{issue.user.login}</p>
              </div>
            </li>
          ))}
        </IssueList>

        <PageButtons>
          <button
            disabled={page === 1}
            onClick={() => this.changePage(false)}
            type="button"
          >
            <FaChevronLeft color="#7159c1" size={14} />
          </button>

          <span>Página {page}</span>
          <button onClick={() => this.changePage(true)} type="button">
            <FaChevronRight color="#7159c1" size={14} />
          </button>
        </PageButtons>
      </Container>
    );
  }
}
