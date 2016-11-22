package dev.gbuchenberger.aleator.domain.repository;

import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.CrudRepository;

import dev.gbuchenberger.aleator.domain.nlp.Tokens;

public interface TokensRepository extends CrudRepository<Tokens, Long> {
	
	
	@Query(value = "SELECT hjid FROM tokens ORDER BY RAND() LIMIT 1", nativeQuery = true)
	Long getRandomTokensId();
	
	@Query(value = "SELECT * FROM tokens ORDER BY RAND() LIMIT 1", nativeQuery = true)
	Tokens getRandomTokens();
	
	Tokens findByHjid(Long hjid);

}
